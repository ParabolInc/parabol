import getRethink from '../database/rethinkDriver'

const getNewTeamLeadUserId = async (teamId) => {
  const r = getRethink()
  return r
    .table('TeamMember')
    .getAll(teamId, {index: 'teamId'})
    .filter({isLead: true})
    .nth(0)('userId')
    .default('')
    .do((userId) => {
      return r.branch(
        userId,
        r
          .table('SuggestedAction')
          .getAll(userId, {index: 'userId'})
          .filter({type: 'tryRetroMeeting'})
          .count()
          .eq(0),
        userId,
        null
      )
    })
}

export default getNewTeamLeadUserId
