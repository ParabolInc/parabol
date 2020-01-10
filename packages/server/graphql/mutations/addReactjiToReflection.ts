import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import {getUserId} from '../../utils/authorization'
import emojiIds from '../../utils/emojiIds.json'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import AddReactjiToReflectionPayload from '../types/AddReactjiToReflectionPayload'

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
    const {meetingId} = reflection
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const viewerMeetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    if (!viewerMeetingMember) {
      return {error: {message: `Not a part of the meeting`}}
    }

    // VALIDATION
    if (!emojiIds.includes(reactji)) {
      return {error: {message: `invalid emoji`}}
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
          reactjis: row('reactjis')
            .append(subDoc)
            .distinct(),
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
