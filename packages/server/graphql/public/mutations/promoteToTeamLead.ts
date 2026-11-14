import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const promoteToTeamLead: MutationResolvers['promoteToTeamLead'] = async (
  _source,
  {teamId, userId},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const oldLead = teamMembers.find(({isLead}) => isLead)
  if (!oldLead) {
    throw new GraphQLError('Team has no team lead', {extensions: {code: 'CONFLICT'}})
  }
  const {id: oldLeadTeamMemberId} = oldLead

  // VALIDATION
  const promoteeOnTeam = teamMembers.find((teamMember) => teamMember.userId === userId)
  if (!promoteeOnTeam) {
    throw new GraphQLError('Team not found', {extensions: {code: 'NOT_FOUND'}})
  }

  // RESOLUTION
  await pg
    .updateTable('TeamMember')
    .set((eb) => ({isLead: eb('id', '=', promoteeOnTeam.id).$castTo<boolean>()}))
    .where('teamId', '=', teamId)
    .where('isNotRemoved', '=', true)
    .execute()
  dataLoader.clearAll('teamMembers')

  const data = {teamId, oldLeaderId: oldLeadTeamMemberId, newLeaderId: promoteeOnTeam.id}
  publish(SubscriptionChannel.TEAM, teamId, 'PromoteToTeamLeadPayload', data, subOptions)
  return data
}

export default promoteToTeamLead
