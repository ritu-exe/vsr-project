// GET all progress
export function getProgress() {
  return JSON.parse(localStorage.getItem("progress")) || [];
}

// SAVE progress
export function saveProgress(data) {
  localStorage.setItem("progress", JSON.stringify(data));
}

// GET today's date
function getToday() {
  return new Date().toISOString().split("T")[0];
}

// UPDATE progress
export function updateProgress(field, value = 1) {
  const today = getToday();

  let data = getProgress();

  let entry = data.find((d) => d.date === today);

  if (!entry) {
    entry = {
      date: today,
      focusTime: 0,
      sessions: 0,
      compilerRuns: 0,
      whiteboardUses: 0,
    };
    data.push(entry);
  }

  entry[field] += value;

  saveProgress(data);
}