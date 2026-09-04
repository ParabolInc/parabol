// mean of the 1-5 Likert answers, on the same scale people answered on, rounded to a tenth so the
// score, the previous cycle's score, and the delta between them always agree. Null when nobody
// answered, since a missing score is not a zero
const averageTeamHealthScore = (scores: number[]) => {
  if (scores.length === 0) return null
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
  return Math.round(mean * 10) / 10
}

export default averageTeamHealthScore
