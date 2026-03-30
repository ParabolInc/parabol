import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMemberAsync} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const setJiraDisplayFieldIds: MutationResolvers['setJiraDisplayFieldIds'] = async (
  _source,
  {teamId, jiraDisplayFieldIds},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  // AUTH
  const team = await dataLoader.get('teams').load(teamId)
  if (!team) {
    throw new GraphQLError('Team not found')
  }
  // Ensuring the user has access to the team
  const viewerId = getUserId(authToken)
  const isMember = await isTeamMemberAsync(viewerId, teamId, dataLoader)
  if (!isMember) {
    throw new GraphQLError('User not on team')
  }

  await getKysely()
    .updateTable('Team')
    .set({jiraDisplayFieldIds})
    .where('id', '=', teamId)
    .execute()

  team.jiraDisplayFieldIds = jiraDisplayFieldIds
  const data = {teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'SetJiraDisplayFieldIdsPayload', data, subOptions)
  return data
}

export default setJiraDisplayFieldIds
