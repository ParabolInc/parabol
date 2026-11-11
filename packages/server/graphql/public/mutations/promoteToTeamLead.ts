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

  // VALIDATION
  const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
  const promoteeOnTeam = teamMembers.find((teamMember) => teamMember.userId === userId)
  if (!promoteeOnTeam) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  // RESOLUTION
  // Taking the team row lock that removeTeamMembers takes means this update reads the leads it leaves behind
  const changedMembers = await pg.transaction().execute(async (trx) => {
    await trx.selectFrom('Team').select('id').where('id', '=', teamId).forNoKeyUpdate().execute()
    return trx
      .updateTable('TeamMember')
      .set((eb) => ({isLead: eb('id', '=', promoteeOnTeam.id).$castTo<boolean>()}))
      .where('teamId', '=', teamId)
      .where('isNotRemoved', '=', true)
      .where((eb) => eb.or([eb('isLead', '=', true), eb('id', '=', promoteeOnTeam.id)]))
      .where((eb) =>
        eb.exists(
          eb
            .selectFrom('TeamMember as Promotee')
            .select('Promotee.id')
            .where('Promotee.id', '=', promoteeOnTeam.id)
            .where('Promotee.isNotRemoved', '=', true)
        )
      )
      .returning(['id', 'isLead'])
      .execute()
  })
  dataLoader.clearAll('teamMembers')
  if (changedMembers.length === 0) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  const oldLeader = changedMembers.find(({isLead}) => !isLead)
  const data = {teamId, oldLeaderId: oldLeader?.id ?? null, newLeaderId: promoteeOnTeam.id}
  publish(SubscriptionChannel.TEAM, teamId, 'PromoteToTeamLeadPayload', data, subOptions)
  return data
}

export default promoteToTeamLead
