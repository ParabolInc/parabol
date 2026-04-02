import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const setJiraDisplayFieldIds: MutationResolvers['setJiraDisplayFieldIds'] = async (
  _source,
  {teamId, jiraDisplayFieldIds},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId}

  await getKysely()
    .updateTable('Team')
    .set({jiraDisplayFieldIds})
    .where('id', '=', teamId)
    .execute()
  dataLoader.clearAll('teams')
  const data = {teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'SetJiraDisplayFieldIdsPayload', data, subOptions)
  return data
}

export default setJiraDisplayFieldIds
