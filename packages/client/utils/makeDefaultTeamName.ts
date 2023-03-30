export const DEFAULT_TEAM_NAMES = ['Bug Writers', 'Long Meeting Lovers', 'Work Procrastinators']

export const makeDefaultTeamName = (teamId: string) => {
  const seed = [...teamId].reduce((prev, cur) => prev + cur.charCodeAt(0), 0)
  const idx = seed % DEFAULT_TEAM_NAMES.length
  // Guaranteed not out of bounds
  return DEFAULT_TEAM_NAMES[idx]!
}
