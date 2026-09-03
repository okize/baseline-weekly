export function digestWindow(runDate = new Date()) {
  const end = new Date(Date.UTC(
    runDate.getUTCFullYear(), runDate.getUTCMonth(), runDate.getUTCDate(),
  ));
  end.setUTCDate(end.getUTCDate() - end.getUTCDay()); // back to Sunday
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 6);
  return { start: iso(start), end: iso(end) };
}

function iso(date) {
  return date.toISOString().slice(0, 10);
}
