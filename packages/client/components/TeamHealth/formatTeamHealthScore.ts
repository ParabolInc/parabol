// Likert means land on a whole number often enough that a hard-coded decimal reads as noise: the
// team answered in whole numbers, so a 4 should print as "4" and only a genuine 4.2 earns its
// decimal. One decimal is the ceiling either way — a mean of five answers has no more precision
// than that, whatever the float says.
export const formatTeamHealthScore = (score: number) => {
  const rounded = Math.round(score * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

// same rule, with the sign kept
export const formatTeamHealthDelta = (delta: number) => {
  const rounded = Math.round(delta * 10) / 10
  return rounded > 0 ? `+${formatTeamHealthScore(rounded)}` : formatTeamHealthScore(rounded)
}
