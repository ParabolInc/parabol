import {sql} from 'kysely'
import TeamPromptResponseId from 'parabol-client/shared/gqlIds/TeamPromptResponseId'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {ValueOf} from '../../../../client/types/generics'
import {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import emojiIds from '../../../utils/emojiIds'
import getGroupedReactjis from '../../../utils/getGroupedReactjis'
import publish from '../../../utils/publish'
import {GQLContext} from '../../graphql'
import {MutationResolvers, ReactableEnum} from '../resolverTypes'
import {getReactableType} from '../types/Reactable'

export const getReactable = (
  reactableDBId: string | number,
  reactableType: ReactableEnum,
  dataLoader: DataLoaderInstance
) => {
  if (reactableType === 'RESPONSE') {
    return dataLoader.get('teamPromptResponses').load(reactableDBId as number)
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

  //AUTH
  const reactableDBId =
    reactableType === 'RESPONSE' ? TeamPromptResponseId.split(reactableId) : reactableId

  const reactable = await getReactable(reactableDBId, reactableType, dataLoader)

  if (!reactable) {
    return {error: {message: `Item does not exist`}}
  }
  const {reactjis} = reactable
  const verifiedType = getReactableType(reactable)
  if (verifiedType !== reactableType) {
    return {error: {message: `Unknown item`}}
  }
  const meetingMemberId = toTeamMemberId(meetingId, viewerId)
  const [viewerMeetingMember, viewer] = await Promise.all([
    dataLoader.get('meetingMembers').load(meetingMemberId),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!viewerMeetingMember) {
    return {error: {message: `Not a member of the meeting`}}
  }

  // VALIDATION
  if (!emojiIds.includes(reactji)) {
    return {error: {message: `invalid emoji`}}
  }

  if (!isRemove) {
    const groupedReactjis = getGroupedReactjis(reactjis, viewerId, reactableId)
    const nextReactjiId = `${reactableId}:${reactji}`
    const isReactjiPresent = !!groupedReactjis.find((agg) => agg.id === nextReactjiId)
    if (!isReactjiPresent && groupedReactjis.length >= Threshold.MAX_REACTJIS) {
      return {error: {message: `Reactji limit reached`}}
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
        .set({reactjis: sql`array_remove("reactjis", (${reactji},${viewerId})::"Reactji")`})
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

  const [meeting] = await Promise.all([
    dataLoader.get('newMeetings').loadNonNull(meetingId),
    updatePG(tableName)
  ])
  dataLoader.clearAll(['comments', 'teamPromptResponses', 'retroReflections'])

  const {meetingType} = meeting

  const data = {reactableId: reactableDBId as any, reactableType}

  analytics.reactjiInteracted(
    viewer,
    meetingId,
    meetingType,
    {...reactable, id: reactableId},
    reactableType,
    reactji,
    !!isRemove
  )
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
