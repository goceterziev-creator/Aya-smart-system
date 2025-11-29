
document.addEventListener("DOMContentLoaded", () => {
  const tripForm = document.getElementById("trip-form");
  const tripList = document.getElementById("trip-list");
  const notesArea = document.getElementById("bibi-notes");

  const TRIPS_KEY = "aya_bibi_trips";
  const NOTES_KEY = "aya_bibi_notes";

  function loadTrips() {
    const raw = localStorage.getItem(TRIPS_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  function saveTrips(trips) {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
  }

  function renderTrips() {
    const trips = loadTrips();
    tripList.innerHTML = "";
    if (trips.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Все още нямаш запазени пътувания.";
      li.style.color = "#9ca3af";
      tripList.appendChild(li);
      return;
    }
    trips.forEach((t, index) => {
      const li = document.createElement("li");
      const main = document.createElement("div");
      main.className = "trip-main";

      const dest = document.createElement("div");
      dest.className = "trip-dest";
      dest.textContent = t.destination;

      const meta = document.createElement("div");
      meta.className = "trip-meta";
      meta.textContent = `${t.dates || "без дати"} · ${t.notes || "без бележка"}`;

      main.appendChild(dest);
      main.appendChild(meta);

      const del = document.createElement("button");
      del.className = "trip-delete";
      del.textContent = "✕";
      del.addEventListener("click", () => {
        const updated = loadTrips().filter((_, i) => i !== index);
        saveTrips(updated);
        renderTrips();
      });

      li.appendChild(main);
      li.appendChild(del);
      tripList.appendChild(li);
    });
  }

  tripForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const destination = document.getElementById("trip-destination").value.trim();
    const dates = document.getElementById("trip-dates").value.trim();
    const notes = document.getElementById("trip-notes").value.trim();
    if (!destination) return;

    const trips = loadTrips();
    trips.push({ destination, dates, notes });
    saveTrips(trips);
    tripForm.reset();
    renderTrips();
  });

  // Notes
  const savedNotes = localStorage.getItem(NOTES_KEY);
  if (savedNotes) {
    notesArea.value = savedNotes;
  }
  notesArea.addEventListener("input", () => {
    localStorage.setItem(NOTES_KEY, notesArea.value);
  });

  renderTrips();
});
