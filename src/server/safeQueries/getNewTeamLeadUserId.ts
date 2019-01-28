import getRethink from '../database/rethinkDriver'

// returns the userId of the team lead if they have never received the initial starting suggested actions
const getNewTeamLeadUserId = async (teamId: string) => {
  const r = getRethink()
  return r
    .table('TeamMember')
    .getAll(teamId, {index: 'teamId'})
    .filter({isLead: true})
    .nth(0)('userId')
    .default('')
    .do((userId) => {
      return r.branch(
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
