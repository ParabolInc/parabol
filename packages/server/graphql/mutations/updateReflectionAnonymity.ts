import {GraphQLID, GraphQLNonNull, GraphQLBoolean} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {getUserId, isTeamMember} from '../../utils/authorization'
import UpdateReflectionAnonymityPayload from '../types/UpdateReflectionAnonymityPayload'
import publish from '../../utils/publish'
import isPhaseComplete from '../../../client/utils/meetings/isPhaseComplete'
import standardError from '../../utils/standardError'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import Reflection from '../../database/types/Reflection'
import {GQLContext} from '../graphql'
import getGroupSmartTitle from 'parabol-client/utils/autogroup/getGroupSmartTitle'
import updateSmartGroupTitle from './helpers/updateReflectionLocation/updateSmartGroupTitle'

export default {
  type: UpdateReflectionAnonymityPayload,
  description: 'Update the anonymity of a reflection',
  args: {
    reflectionId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    isAnonymous: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'A boolean indicating the anonymity of a refrlection'
    }
  },
  async resolve(
    _source,
    {reflectionId, isAnonymous},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const now = new Date()
    const subOptions = {operationId, mutatorId}

    // AUTH
    const viewerId = getUserId(authToken)
    const reflection = await r
      .table('RetroReflection')
      .get(reflectionId)
      .run()
    if (!reflection) {
      return standardError(new Error('Reflection not found'), {userId: viewerId})
    }
    const {creatorId, meetingId, reflectionGroupId} = reflection
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {endedAt, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete(NewMeetingPhaseTypeEnum.group, phases)) {
      return standardError(new Error('Meeting phase already ended'), {userId: viewerId})
    }
    if (creatorId !== viewerId) {
      return standardError(new Error('Reflection not found'), {userId: viewerId})
    }

    await r
      .table('RetroReflection')
      .get(reflectionId)
      .update({
        isAnonymous,
        updatedAt: now
      })
      .run()

    const reflectionsInGroup = (await r
      .table('RetroReflection')
      .getAll(reflectionGroupId, {index: 'reflectionGroupId'})
      .filter({isActive: true})
      .run()) as Reflection[]

    const newTitle = getGroupSmartTitle(reflectionsInGroup)
    await updateSmartGroupTitle(reflectionGroupId, newTitle)

    const data = {meetingId, reflectionId}
    publish(
      SubscriptionChannel.MEETING,
      meetingId,
      'UpdateReflectionAnonymityPayload',
      data,
      subOptions
    )
    return data
  }
}
