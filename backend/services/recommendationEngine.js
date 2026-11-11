const norm = value => String(value || "").trim().toLowerCase();

export function recommendPlaces(places, preferences = {}) {
  const categories = (preferences.categories || []).map(norm);
  const interests = (preferences.interests || []).map(norm);
  const budget = Number(preferences.budget || 0);
  const location = norm(preferences.preferredLocation);
  const duration = Number(preferences.duration || 0);

  return places.map(place => {
    let score = 0;
    const reasons = [];
    if (categories.includes(norm(place.category))) { score += 35; reasons.push(`matches your ${place.category} interest`); }
    const text = `${place.description} ${(place.facilities || []).join(" ")}`.toLowerCase();
    const matched = interests.filter(i => i && text.includes(i));
    if (matched.length) { score += Math.min(25, matched.length * 10); reasons.push(`matches interests: ${matched.join(", ")}`); }
    if (budget > 0) {
      if (Number(place.entryFee || 0) <= budget) { score += 15; reasons.push("fits your entry-fee budget"); }
      else score -= 10;
    }
    if (location && norm(place.location).includes(location)) { score += 15; reasons.push("is in your preferred location"); }
    if (duration > 0 && Number(place.durationHours || 2) <= duration * 4) { score += 5; reasons.push("fits your available travel duration"); }
    score += Math.min(10, Number(place.rating || 0) * 2);
    if (place.featured) score += 5;
    score = Math.max(0, Math.min(100, Math.round(score)));
    return { place, score, reason: reasons.length ? `Recommended because it ${reasons.join(" and ")}.` : "A popular destination you may enjoy based on its rating and visitor interest." };
  }).sort((a, b) => b.score - a.score);
}
