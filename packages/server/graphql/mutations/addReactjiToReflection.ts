import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel, Threshold} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import emojiIds from '../../utils/emojiIds.json'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import AddReactjiToReflectionPayload from '../types/AddReactjiToReflectionPayload'
import getGroupedReactjis from '../../utils/getGroupedReactjis'

const addReactjiToReflection = {
  type: GraphQLNonNull(AddReactjiToReflectionPayload),
  description: `Add or remove a reactji to a reflection`,
  args: {
    reflectionId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The reflection getting the reaction'
    },
    reactji: {
      type: GraphQLNonNull(GraphQLString),
      description: 'the id of the reactji to add'
    },
    isRemove: {
      type: GraphQLBoolean,
      description: 'If true, remove the reaction, else add it'
    }
  },
  resolve: async (
    _source,
    {reflectionId, reactji, isRemove},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const now = new Date()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    //AUTH
    const reflection = await r
      .table('RetroReflection')
      .get(reflectionId)
      .run()
    if (!reflection) {
      return {error: {message: `Reflection does not exist`}}
    }
    const {meetingId, reactjis} = reflection
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const viewerMeetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    if (!viewerMeetingMember) {
      return {error: {message: `Not a part of the meeting`}}
    }

    // VALIDATION
    if (!emojiIds.includes(reactji)) {
      return {error: {message: `invalid emoji`}}
    }

    if (!isRemove) {
      const groupedReactjis = getGroupedReactjis(reactjis, viewerId, reflectionId)
      const nextReactjiId = `${reflectionId}:${reactji}`
      const isReactjiPresent = !!groupedReactjis.find((agg) => agg.id === nextReactjiId)
      // console.log('is present', isReactjiPresent, reactji, groupedReactjis)
      if (!isReactjiPresent && groupedReactjis.length >= Threshold.REFLECTION_REACTJIS) {
        return {error: {message: `Reactji limit reached`}}
      }
    }

    // RESOLUTION
    const subDoc = {id: reactji, userId: viewerId}
    if (isRemove) {
      await r
        .table('RetroReflection')
        .get(reflectionId)
        .update((row) => ({
          reactjis: row('reactjis').difference([subDoc]),
          updatedAt: now
        }))
        .run()
    } else {
      await r
        .table('RetroReflection')
        .get(reflectionId)
        .update((row) => ({
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

    const data = {reflectionId}
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'AddReactjiToReflectionSuccess',
      data,
      subOptions
    )
    return data
  }
}

export default addReactjiToReflection
