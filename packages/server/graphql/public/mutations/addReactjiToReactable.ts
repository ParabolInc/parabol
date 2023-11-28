import TeamPromptResponseId from 'parabol-client/shared/gqlIds/TeamPromptResponseId'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import {ValueOf} from 'parabol-client/types/generics'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../../database/rethinkDriver'
import {RDatum} from '../../../database/stricterR'
import Comment from '../../../database/types/Comment'
import {Reactable} from '../../../database/types/Reactable'
import Reflection from '../../../database/types/Reflection'
import getPg from '../../../postgres/getPg'
import {appendTeamResponseReactji} from '../../../postgres/queries/generated/appendTeamResponseReactjiQuery'
import {removeTeamResponseReactji} from '../../../postgres/queries/generated/removeTeamResponseReactjiQuery'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import emojiIds from '../../../utils/emojiIds'
import getGroupedReactjis from '../../../utils/getGroupedReactjis'
import publish from '../../../utils/publish'
import {GQLContext} from '../../graphql'

import getReactableType from '../../types/getReactableType'
import {ReactableEnumType} from '../../types/ReactableEnum'
import getKysely from '../../../postgres/getKysely'
import {AnyMeeting} from '../../../postgres/types/Meeting'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import {TeamPromptResponse} from '../../../postgres/queries/getTeamPromptResponsesByIds'
import {MutationResolvers} from '../resolverTypes'
import NotificationKudosReceived from '../../../database/types/NotificationKudosReceived'
import publishNotification from './helpers/publishNotification'

const rethinkTableLookup = {
  COMMENT: 'Comment',
  REFLECTION: 'RetroReflection'
} as const

const pgDataloaderLookup = {
  RESPONSE: 'teamPromptResponses'
} as const

const getReactableCreatorId = (
  reactableType: ReactableEnumType,
  reactable: Reactable,
  meeting: AnyMeeting
) => {
  if (reactableType === 'COMMENT') {
    if ((reactable as Comment).isAnonymous) {
      return null
    }
    return (reactable as Comment).createdBy
  } else if (reactableType === 'REFLECTION') {
    if ((meeting as MeetingRetrospective).disableAnonymity) {
      return (reactable as Reflection).creatorId
    }
    return null
  } else if (reactableType === 'RESPONSE') {
    return (reactable as TeamPromptResponse).userId
  }

  return null
}

const addReactjiToReactable: MutationResolvers['addReactjiToReactable'] = async (
  _source: unknown,
  {
    reactableId,
    reactableType,
    reactji,
    isRemove,
    meetingId
  }: {
    reactableId: string
    reactableType: ReactableEnumType
    reactji: string
    isRemove?: boolean | null
    meetingId: string
  },
  {authToken, dataLoader, socketId: mutatorId}: GQLContext
) => {
  const r = await getRethink()
  const pg = getKysely()
  const viewerId = getUserId(authToken)
  const now = new Date()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  //AUTH
  let reactable: Reactable
  const pgLoaderName = pgDataloaderLookup[
    reactableType as keyof typeof pgDataloaderLookup
  ] as ValueOf<typeof pgDataloaderLookup> | null
  const rethinkDbTable = rethinkTableLookup[reactableType as keyof typeof rethinkTableLookup]
  if (pgLoaderName) {
    reactable = await dataLoader.get(pgLoaderName).loadNonNull(reactableId)
  } else {
    reactable = (await r.table(rethinkDbTable).get(reactableId).run()) as Reactable
  }
  if (!reactable) {
    return {error: {message: `Item does not exist`}}
  }
  const {reactjis} = reactable
  const verifiedType = getReactableType(reactable)
  if (verifiedType !== reactableType) {
    return {error: {message: `Unknown item`}}
  }
  const meetingMemberId = toTeamMemberId(meetingId, viewerId)
  const viewerMeetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
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
  if (pgLoaderName) {
    const numberReactableId = TeamPromptResponseId.split(reactableId)
    if (isRemove) {
      await removeTeamResponseReactji.run(
        {id: numberReactableId, reactji: {shortname: reactji, userid: viewerId}},
        getPg()
      )
    } else {
      await appendTeamResponseReactji.run(
        {id: numberReactableId, reactji: {shortname: reactji, userid: viewerId}},
        getPg()
      )
    }

    dataLoader.get(pgLoaderName).clear(reactableId)
  } else {
    if (isRemove) {
      await r
        .table(rethinkDbTable)
        .get(reactableId)
        .update((row: RDatum<Comment | Reflection>) => ({
          reactjis: row('reactjis').difference([subDoc]),
          updatedAt: now
        }))
        .run()
    } else {
      await r
        .table(rethinkDbTable)
        .get(reactableId)
        .update((row: RDatum<Comment | Reflection>) => ({
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

  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {meetingType, teamId} = meeting
  const team = await dataLoader.get('teams').loadNonNull(teamId)

  const reactableCreatorId = getReactableCreatorId(reactableType, reactable, meeting)

  let addedKudosId = null
  if (
    !isRemove &&
    team.giveKudosWithEmoji &&
    reactji === team.kudosEmoji &&
    reactableCreatorId &&
    reactableCreatorId !== viewerId
  ) {
    addedKudosId = (await pg
      .insertInto('Kudoses')
      .values({
        senderUserId: viewerId,
        receiverUserId: reactableCreatorId,
        reactableType: reactableType,
        reactableId: reactableId,
        teamId,
        emoji: team.kudosEmoji
      })
      .returning('id')
      .executeTakeFirst())!.id

    const senderUser = await dataLoader.get('users').loadNonNull(viewerId)

    const notificationsToInsert = new NotificationKudosReceived({
      userId: reactableCreatorId,
      senderUserId: viewerId,
      meetingId,
      meetingName: meeting.name,
      emoji: team.kudosEmoji,
      name: senderUser.preferredName,
      picture: senderUser.picture
    })

    await r.table('Notification').insert(notificationsToInsert).run()

    publishNotification(notificationsToInsert, subOptions)

    analytics.kudosSent(viewerId, teamId, addedKudosId, reactableCreatorId)
  }

  const data = {reactableId, reactableType, addedKudosId}

  analytics.reactjiInteracted(
    viewerId,
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
