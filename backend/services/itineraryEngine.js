export function buildItinerary(placeIds, places, startDate, endDate) {
  const start = new Date(startDate), end = new Date(endDate);
  const days = Math.max(1, Math.ceil((end - start) / 86400000) + 1);
  const grouped = Array.from({ length: days }, (_, i) => ({
    day: i + 1, date: new Date(start.getTime() + i * 86400000),
    places: placeIds.slice(i * 3, (i + 1) * 3).map(id => places.find(p => String(p._id) === String(id))).filter(Boolean)
  }));
  return grouped;
}
