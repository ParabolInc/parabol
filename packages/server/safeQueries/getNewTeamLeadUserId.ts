import getRethink from '../database/rethinkDriver'
import {RDatum} from '../database/stricterR'

// returns the userId of the team lead if they have never received the initial starting suggested actions
const getNewTeamLeadUserId = async (teamId: string) => {
  const r = await getRethink()
  return r
    .table('TeamMember')
    .getAll(teamId, {index: 'teamId'})
    .filter({isLead: true})
    .nth(0)('userId')
    .default('')
    .do((userId: RDatum) => {
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
    .run()
}

export default getNewTeamLeadUserId
