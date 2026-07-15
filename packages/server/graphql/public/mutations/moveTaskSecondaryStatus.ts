import TaskSecondaryStatusId from 'parabol-client/shared/gqlIds/TaskSecondaryStatusId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const moveTaskSecondaryStatus: MutationResolvers['moveTaskSecondaryStatus'] = async (
  _source,
  {id, sortOrder},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // VALIDATION (shield already verified team membership via the row)
  const taskSecondaryStatusId = TaskSecondaryStatusId.split(id)
  const row = await dataLoader.get('taskSecondaryStatuses').loadNonNull(taskSecondaryStatusId)
  const {teamId} = row

  // RESOLUTION
  await pg
    .updateTable('TaskSecondaryStatus')
    .set({sortOrder})
    .where('id', '=', taskSecondaryStatusId)
    .execute()
  dataLoader.clearAll('taskSecondaryStatuses')

  const data = {taskSecondaryStatusId, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'MoveTaskSecondaryStatusSuccess', data, subOptions)
  return data
}

export default moveTaskSecondaryStatus
