
document.addEventListener("DOMContentLoaded", () => {
  const TRIPS_KEY = "aya_bibi_trips";
  const NOTES_KEY = "aya_bibi_notes";
  const REQUESTS_KEY = "aya_bibi_requests";

  const tripForm = document.getElementById("trip-form");
  const tripList = document.getElementById("trip-list");
  const notesArea = document.getElementById("bibi-notes");
  const reqList = document.getElementById("request-list");

  function load(key){ try{ return JSON.parse(localStorage.getItem(key))||[] }catch{ return [] } }
  function save(key, value){ localStorage.setItem(key, JSON.stringify(value)) }

  function renderTrips(){
    const trips = load(TRIPS_KEY);
    tripList.innerHTML = "";
    if(!trips.length){
      const li = document.createElement("li");
      li.className = "small";
      li.textContent = "Все още нямаш запазени пътувания.";
      tripList.appendChild(li);
      return;
    }
    trips.forEach((t, i) => {
      const li = document.createElement("li");
      li.className = "trip";
      const main = document.createElement("div");
      main.className = "trip-main";
      const d = document.createElement("div");
      d.className = "trip-dest";
      d.textContent = t.destination;
      const m = document.createElement("div");
      m.className = "trip-meta";
      m.textContent = `${t.dates||"без дати"} · ${t.notes||"без бележка"}`;
      main.appendChild(d); main.appendChild(m);

      const actions = document.createElement("div");
      actions.className = "trip-actions";
      const del = document.createElement("button");
      del.className = "trip-del";
      del.textContent = "Изтрий";
      del.addEventListener("click", () => {
        const arr = load(TRIPS_KEY).filter((_, idx) => idx !== i);
        save(TRIPS_KEY, arr); renderTrips();
      });
      actions.appendChild(del);

      li.appendChild(main);
      li.appendChild(actions);
      tripList.appendChild(li);
    });
  }

  tripForm.addEventListener("submit", e => {
    e.preventDefault();
    const dest = document.getElementById("trip-destination").value.trim();
    const dates = document.getElementById("trip-dates").value.trim();
    const notes = document.getElementById("trip-notes").value.trim();
    if(!dest) return;
    const arr = load(TRIPS_KEY);
    arr.push({destination: dest, dates, notes});
    save(TRIPS_KEY, arr);
    tripForm.reset();
    renderTrips();
  });

  const savedNotes = localStorage.getItem(NOTES_KEY);
  if(savedNotes) notesArea.value = savedNotes;
  notesArea.addEventListener("input", () => localStorage.setItem(NOTES_KEY, notesArea.value));

  function renderRequests(){
    const requests = load(REQUESTS_KEY);
    reqList.innerHTML = "";
    if(!requests.length){
      const li = document.createElement("li");
      li.className = "small";
      li.textContent = "Нямаш записани клиентски заявки още.";
      reqList.appendChild(li);
      return;
    }
    requests.forEach((r, i) => {
      const li = document.createElement("li");
      li.className = "request-item";
      const meta = document.createElement("div");
      meta.className = "request-meta";
      meta.textContent = `${r.source} · ${r.created}`;
      const body = document.createElement("div");
      body.textContent = r.text;
      li.appendChild(meta);
      li.appendChild(body);
      reqList.appendChild(li);
    });
  }

  function addRequest(source, text){
    const trimmed = text.trim();
    if(!trimmed) return;
    const requests = load(REQUESTS_KEY);
    const now = new Date();
    const created = now.toLocaleDateString("bg-BG", { day:"2-digit", month:"2-digit", year:"numeric" }) +
      " " + now.toLocaleTimeString("bg-BG", { hour:"2-digit", minute:"2-digit" });
    requests.unshift({ source, text: trimmed, created });
    save(REQUESTS_KEY, requests);
    renderRequests();
  }

  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = {
    voice: document.getElementById("tab-voice"),
    whatsapp: document.getElementById("tab-whatsapp"),
    email: document.getElementById("tab-email")
  };

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.toggle("active", b === btn));
      Object.entries(tabPanels).forEach(([key, el]) => {
        el.classList.toggle("active", key === tab);
      });
    });
  });

  const voiceInput = document.getElementById("voice-input");
  const voiceStatus = document.getElementById("voice-status");
  const voiceStart = document.getElementById("voice-start");
  const voiceSave = document.getElementById("voice-save");

  let recognition = null;
  if("webkitSpeechRecognition" in window || "SpeechRecognition" in window){
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.lang = "bg-BG";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(" ");
      voiceInput.value = (voiceInput.value + " " + text).trim();
      voiceStatus.textContent = "✅ Гласов запис добавен.";
    };
    recognition.onerror = () => {
      voiceStatus.textContent = "❌ Проблем с микрофона или разрешенията.";
    };
    recognition.onend = () => {
      voiceStart.disabled = false;
      voiceStart.textContent = "Start voice note";
    };
  }

  voiceStart.addEventListener("click", () => {
    if(!recognition){
      voiceStatus.textContent = "Твоят браузър не поддържа гласово разпознаване. Просто напиши текста.";
      return;
    }
    try{
      voiceStart.disabled = true;
      voiceStart.textContent = "Listening...";
      voiceStatus.textContent = "Говори след звуковия сигнал и изчакай...";
      recognition.start();
    }catch{
      voiceStatus.textContent = "Не успях да стартирам записа.";
      voiceStart.disabled = false;
      voiceStart.textContent = "Start voice note";
    }
  });

  voiceSave.addEventListener("click", () => {
    addRequest("Voice", voiceInput.value);
    voiceInput.value = "";
    voiceStatus.textContent = "✅ Заявката е записана в списъка.";
  });

  document.getElementById("wa-save").addEventListener("click", () => {
    const txt = document.getElementById("wa-input").value;
    addRequest("WhatsApp", txt);
    document.getElementById("wa-input").value = "";
  });

  document.getElementById("mail-save").addEventListener("click", () => {
    const txt = document.getElementById("mail-input").value;
    addRequest("Email", txt);
    document.getElementById("mail-input").value = "";
  });

  document.getElementById("save-pdf").addEventListener("click", () => {
    window.print();
  });

  document.getElementById("open-offers").addEventListener("click", () => {
    window.location.href = "index.html#how";
  });

  document.getElementById("go-whatsapp").addEventListener("click", () => {
    const trips = load(TRIPS_KEY);
    const top = trips[trips.length - 1];
    const msg = top
      ? `Здравей, AYA! Искам оферта за: ${top.destination} (${top.dates || "без дати"}). Бележки: ${top.notes || "-"}.`
      : "Здравей, AYA! Искам да започна нов план за пътуване.";
    const url = "https://wa.me/?text=" + encodeURIComponent(msg);
    window.open(url, "_blank");
  });

  renderTrips();
  renderRequests();
});
