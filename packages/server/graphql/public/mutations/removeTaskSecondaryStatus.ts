import TaskSecondaryStatusId from 'parabol-client/shared/gqlIds/TaskSecondaryStatusId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const removeTaskSecondaryStatus: MutationResolvers['removeTaskSecondaryStatus'] = async (
  _source,
  {id},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // VALIDATION (shield already verified team membership via the row)
  const taskSecondaryStatusId = TaskSecondaryStatusId.split(id)
  const row = await dataLoader.get('taskSecondaryStatuses').loadNonNull(taskSecondaryStatusId)
  const {teamId} = row

  // RESOLUTION — FK ON DELETE SET NULL reverts referencing tasks to their bare primary
  await pg.deleteFrom('TaskSecondaryStatus').where('id', '=', taskSecondaryStatusId).execute()
  // tasks' secondaryStatusId may have been nulled by the FK — clear both caches
  dataLoader.clearAll(['taskSecondaryStatuses', 'tasks'])

  const data = {taskSecondaryStatusId, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'RemoveTaskSecondaryStatusSuccess', data, subOptions)
  return data
}

export default removeTaskSecondaryStatus
