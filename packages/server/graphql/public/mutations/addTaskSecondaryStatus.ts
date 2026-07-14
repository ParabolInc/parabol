import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

export const MAX_SECONDARY_STATUSES_PER_TEAM = 25

const addTaskSecondaryStatus: MutationResolvers['addTaskSecondaryStatus'] = async (
  _source,
  {teamId, status, label, sortOrder},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // VALIDATION
  const trimmedLabel = label.trim()
  if (trimmedLabel.length === 0) throw new GraphQLError('Label cannot be empty')
  if (trimmedLabel.length > 100) throw new GraphQLError('Label must be 100 characters or fewer')
  const existing = await dataLoader.get('taskSecondaryStatusesByTeamId').load(teamId)
  if (existing.length >= MAX_SECONDARY_STATUSES_PER_TEAM) {
    throw new GraphQLError(
      `Teams are limited to ${MAX_SECONDARY_STATUSES_PER_TEAM} secondary statuses`
    )
  }
  const dupe = existing.find(
    (row) => row.status === status && row.label.toLowerCase() === trimmedLabel.toLowerCase()
  )
  if (dupe) {
    throw new GraphQLError(`A "${trimmedLabel}" secondary status already exists under ${status}`)
  }

  // RESOLUTION
  const inserted = await pg
    .insertInto('TaskSecondaryStatus')
    .values({teamId, status, label: trimmedLabel, sortOrder})
    .returning('id')
    .executeTakeFirst()
    .catch((e) => {
      // unique-violation backstop for concurrent adds racing the dupe pre-check
      if (e && typeof e === 'object' && 'code' in e && (e as {code?: string}).code === '23505') {
        throw new GraphQLError(
          `A "${trimmedLabel}" secondary status already exists under ${status}`
        )
      }
      throw e
    })
  if (!inserted) throw new GraphQLError('Could not create secondary status')
  dataLoader.clearAll('taskSecondaryStatuses')

  const data = {taskSecondaryStatusId: inserted.id, teamId}
  publish(SubscriptionChannel.TEAM, teamId, 'AddTaskSecondaryStatusSuccess', data, subOptions)
  return data
}

export default addTaskSecondaryStatus
