/**
 * @deprecated Use `TeamMemberId.join(teamId, userId)` from `client/shared/gqlIds/TeamMemberId`
 * instead. This helper duplicates that logic and should be migrated away from over time.
 */
const toTeamMemberId = (teamId: string, userId: string) => `${userId}::${teamId}`

export default toTeamMemberId
