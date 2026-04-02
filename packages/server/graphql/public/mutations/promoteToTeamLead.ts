import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import type {MutationResolvers} from '../resolverTypes'

const promoteToTeamLead: MutationResolvers['promoteToTeamLead'] = async (
  _source,
  {teamId, userId},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const viewerId = getUserId(authToken)

  // AUTH
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const oldLead = teamMembers.find(({isLead}) => isLead)
  if (!oldLead) {
    return standardError(new Error('Team has no team lead'), {userId: viewerId})
  }
  const {id: oldLeadTeamMemberId} = oldLead

  // VALIDATION
  const promoteeOnTeam = teamMembers.find((teamMember) => teamMember.userId === userId)
  if (!promoteeOnTeam) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // RESOLUTION
  await pg
    .updateTable('TeamMember')
    .set(({not}) => ({isLead: not('isLead')}))
    .where('id', 'in', [oldLeadTeamMemberId, promoteeOnTeam.id])
    .execute()
  dataLoader.clearAll('teamMembers')

  const data = {teamId, oldLeaderId: oldLeadTeamMemberId, newLeaderId: promoteeOnTeam.id}
  publish(SubscriptionChannel.TEAM, teamId, 'PromoteToTeamLeadPayload', data, subOptions)
  return data
}

export default promoteToTeamLead
