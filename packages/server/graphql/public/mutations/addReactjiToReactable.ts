import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import TeamPromptResponseId from 'parabol-client/shared/gqlIds/TeamPromptResponseId'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import type {ValueOf} from '../../../../client/types/generics'
import type {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'
import {getUserId} from '../../../utils/authorization'
import emojiIds from '../../../utils/emojiIds'
import getGroupedReactjis from '../../../utils/getGroupedReactjis'
import publish from '../../../utils/publish'
import type {GQLContext} from '../../graphql'
import type {MutationResolvers, ReactableEnum} from '../resolverTypes'
import {getReactableType} from '../types/Reactable'

export const getReactable = async (
  reactableDBId: string | number,
  reactableType: ReactableEnum,
  dataLoader: DataLoaderInstance
) => {
  if (reactableType === 'RESPONSE') {
    const response = await dataLoader.get('teamPromptResponses').load(reactableDBId as number)
    return response?.sharedAt ? response : undefined
  }
  if (reactableType === 'COMMENT') {
    return dataLoader.get('comments').load(reactableDBId as string)
  }
  return dataLoader.get('retroReflections').load(reactableDBId as string)
}

const tableLookup = {
  RESPONSE: 'TeamPromptResponse',
  COMMENT: 'Comment',
  REFLECTION: 'RetroReflection'
} as const

const addReactjiToReactable: MutationResolvers['addReactjiToReactable'] = async (
  _source: unknown,
  {reactableId, reactableType, reactji, isRemove, meetingId},
  {authToken, dataLoader, socketId: mutatorId}: GQLContext
) => {
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const reactableDBId =
    reactableType === 'RESPONSE' ? TeamPromptResponseId.split(reactableId) : reactableId

  const reactable = await getReactable(reactableDBId, reactableType, dataLoader)

  if (!reactable) {
    throw new GraphQLError('Item does not exist', {extensions: {code: 'NOT_FOUND'}})
  }
  const {reactjis} = reactable
  const verifiedType = getReactableType(reactable)
  if (verifiedType !== reactableType) {
    throw new GraphQLError('Unknown item', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  // VALIDATION
  if (!emojiIds.includes(reactji)) {
    throw new GraphQLError('invalid emoji', {extensions: {code: 'BAD_USER_INPUT'}})
  }

  if (!isRemove) {
    const groupedReactjis = getGroupedReactjis(reactjis, viewerId, reactableId)
    const nextReactjiId = `${reactableId}:${reactji}`
    const isReactjiPresent = !!groupedReactjis.find((agg) => agg.id === nextReactjiId)
    if (!isReactjiPresent && groupedReactjis.length >= Threshold.MAX_REACTJIS) {
      throw new GraphQLError('Reactji limit reached', {extensions: {code: 'CONFLICT'}})
    }
  }

  // RESOLUTION
  const tableName = tableLookup[reactableType]
  const dbId =
    tableName === 'TeamPromptResponse' ? TeamPromptResponseId.split(reactableId) : reactableId

  const updatePG = async (pgTable: ValueOf<typeof tableLookup>) => {
    if (isRemove) {
      await pg
        .updateTable(pg.dynamic.table(pgTable).as('t'))
        .set({
          reactjis: sql`array_remove("reactjis", (${reactji},${viewerId})::"Reactji")`
        })
        .where('id', '=', dbId)
        .execute()
    } else {
      await pg
        .updateTable(pg.dynamic.table(pgTable).as('t'))
        .set({
          reactjis: sql`arr_append_uniq("reactjis", (${reactji},${viewerId})::"Reactji")`
        })
        .where('id', '=', dbId)
        .execute()
    }
  }

  await updatePG(tableName)
  dataLoader.clearAll(['comments', 'teamPromptResponses', 'retroReflections'])

  const data = {reactableId: reactableDBId as any, reactableType}

  if (meetingId) {
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'AddReactjiToReactableSuccess',
      data,
      subOptions
    )
  }
  return data
}

export default addReactjiToReactable
