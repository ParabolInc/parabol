import {sql} from 'kysely'
import TeamPromptResponseId from 'parabol-client/shared/gqlIds/TeamPromptResponseId'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {ValueOf} from '../../../../client/types/generics'
import getRethink from '../../../database/rethinkDriver'
import {RDatum} from '../../../database/stricterR'
import Comment from '../../../database/types/Comment'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import emojiIds from '../../../utils/emojiIds'
import getGroupedReactjis from '../../../utils/getGroupedReactjis'
import publish from '../../../utils/publish'
import {GQLContext} from '../../graphql'
import getReactableType from '../../types/getReactableType'
import {MutationResolvers} from '../resolverTypes'

const dataLoaderLookup = {
  RESPONSE: 'teamPromptResponses',
  COMMENT: 'comments',
  REFLECTION: 'retroReflections'
} as const

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
  const r = await getRethink()
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const now = new Date()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  //AUTH
  const loaderName = dataLoaderLookup[reactableType]
  const reactable = await dataLoader.get(loaderName).load(reactableId)
  dataLoader.get(loaderName).clear(reactableId)

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
  const subDoc = {id: reactji, userId: viewerId}
  const tableName = tableLookup[reactableType]
  const dbId =
    tableName === 'TeamPromptResponse' ? TeamPromptResponseId.split(reactableId) : reactableId

  const updatePG = async (pgTable: ValueOf<typeof tableLookup>) => {
    if (pgTable === 'Comment') return
    if (isRemove) {
      await pg
        .updateTable(pgTable)
        .set({reactjis: sql`array_remove("reactjis", (${reactji},${viewerId})::"Reactji")`})
        .where('id', '=', dbId)
        .execute()
    } else {
      await pg
        .updateTable(pgTable)
        .set({
          reactjis: sql`arr_append_uniq("reactjis", (${reactji},${viewerId})::"Reactji")`
        })
        .where('id', '=', dbId)
        .execute()
    }
  }

  const updateRethink = async (rethinkDbTable: ValueOf<typeof tableLookup>) => {
    if (rethinkDbTable === 'TeamPromptResponse' || rethinkDbTable === 'RetroReflection') return
    if (isRemove) {
      await r
        .table(rethinkDbTable)
        .get(dbId)
        .update((row: RDatum<Comment>) => ({
          reactjis: row('reactjis').difference([subDoc]),
          updatedAt: now
        }))
        .run()
    } else {
      await r
        .table(rethinkDbTable)
        .get(dbId)
        .update((row: RDatum<Comment>) => ({
          reactjis: r.branch(
            row('reactjis').contains(subDoc),
            row('reactjis'),
            // don't use distinct, it sorts the fields
            row('reactjis').append(subDoc)
          ),
          updatedAt: now
        }))
        .run()
    }
  }
  const [meeting] = await Promise.all([
    dataLoader.get('newMeetings').load(meetingId),
    updatePG(tableName),
    updateRethink(tableName)
  ])

  const {meetingType} = meeting

  const data = {reactableId, reactableType}

  analytics.reactjiInteracted(
    viewer,
    meetingId,
    meetingType,
    reactable,
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
