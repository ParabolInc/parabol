import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import EditReflectionPayload from '../types/EditReflectionPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import isPhaseComplete from 'parabol-client/utils/meetings/isPhaseComplete'
import standardError from '../../utils/standardError'
import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

export default {
  description: 'Changes the editing state of a user for a phase item',
  type: EditReflectionPayload,
  args: {
    isEditing: {
      description: 'Whether a reflectPrompt is being edited or not',
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    promptId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source,
    {isEditing, meetingId, promptId},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const reflectPrompt = await r
      .table('ReflectPrompt')
      .get(promptId)
      .run()
    if (!reflectPrompt || !reflectPrompt.isActive) {
      return standardError(new Error('Category not found'), {userId: viewerId})
    }
    const {teamId} = reflectPrompt
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId, tags: {teamId}})
    }

    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, phases} = meeting
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete(NewMeetingPhaseTypeEnum.group, phases)) {
      return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
    }

    // RESOLUTION
    const data = {promptId, editorId: mutatorId, isEditing}
    publish(SubscriptionChannel.MEETING, meetingId, 'EditReflectionPayload', data, subOptions)
    return data
  }
}
