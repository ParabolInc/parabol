const defaultTeamNames = ['Bug Writers', 'Long Meeting Lovers', 'Work Procrastinators']

export const makeDefaultTeamName = (teamId: string) => {
  const seed = [...teamId].reduce((prev, cur) => prev + cur.charCodeAt(0), 0)
  const idx = seed % defaultTeamNames.length
  // Guaranteed not out of bounds
  return defaultTeamNames[idx]!
}
