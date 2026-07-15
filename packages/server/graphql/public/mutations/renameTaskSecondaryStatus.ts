import {GraphQLError} from 'graphql'
import TaskSecondaryStatusId from 'parabol-client/shared/gqlIds/TaskSecondaryStatusId'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const renameTaskSecondaryStatus: MutationResolvers['renameTaskSecondaryStatus'] = async (
  _source,
  {id, label},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // VALIDATION (shield already verified team membership via the row)
  const taskSecondaryStatusId = TaskSecondaryStatusId.split(id)
  const row = await dataLoader.get('taskSecondaryStatuses').loadNonNull(taskSecondaryStatusId)
  const {teamId, status} = row
  const trimmedLabel = label.trim()
  if (trimmedLabel.length === 0) throw new GraphQLError('Label cannot be empty')
  if (trimmedLabel.length > 100) throw new GraphQLError('Label must be 100 characters or fewer')
  const siblings = await dataLoader.get('taskSecondaryStatusesByTeamId').load(teamId)
  const dupe = siblings.find(
    (sibling) =>
      sibling.id !== taskSecondaryStatusId &&
      sibling.status === status &&
      sibling.label.toLowerCase() === trimmedLabel.toLowerCase()
  )
  if (dupe) {
    throw new GraphQLError(`A "${trimmedLabel}" secondary status already exists under ${status}`)
  }

  // RESOLUTION
  await pg
    .updateTable('TaskSecondaryStatus')
    .set({label: trimmedLabel})
    .where('id', '=', taskSecondaryStatusId)
    .execute()
    .catch((e) => {
      if (e && typeof e === 'object' && 'code' in e && (e as {code?: string}).code === '23505') {
        throw new GraphQLError(
          `A "${trimmedLabel}" secondary status already exists under ${status}`
        )
      }
      throw e
    })
  dataLoader.clearAll('taskSecondaryStatuses')

  const data = {taskSecondaryStatusId, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'RenameTaskSecondaryStatusSuccess', data, subOptions)
  return data
}

export default renameTaskSecondaryStatus
