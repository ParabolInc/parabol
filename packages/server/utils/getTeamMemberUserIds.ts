import getKysely from '../postgres/getKysely'

export const getTeamMemberUserIds = async (teamIds: string[]) => {
  if (!teamIds || teamIds.length === 0) return []
  const pg = getKysely()
  return pg
    .selectFrom('TeamMember')
    .select('userId')
    .distinct()
    .where('teamId', 'in', teamIds)
    .where('isNotRemoved', '=', true)
    .execute()
}
