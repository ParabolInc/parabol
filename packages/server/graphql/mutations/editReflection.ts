import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import EditReflectionPayload from '../types/EditReflectionPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import isPhaseComplete from '../../../client/utils/meetings/isPhaseComplete'
import standardError from '../../utils/standardError'
import {NewMeetingPhaseTypeEnum} from 'parabol-client/types/graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'

export default {
  description: 'Changes the editing state of a user for a phase item',
  type: EditReflectionPayload,
  args: {
    isEditing: {
      description: 'Whether a phaseItem is being edited or not',
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    phaseItemId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  async resolve(
    _source,
    {isEditing, meetingId, phaseItemId},
    {authToken, dataLoader, socketId: mutatorId}
  ) {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const phaseItem = await r
      .table('CustomPhaseItem')
      .get(phaseItemId)
      .run()
    if (!phaseItem || !phaseItem.isActive) {
      return standardError(new Error('Category not found'), {userId: viewerId})
    }
    const {teamId} = phaseItem
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
    const data = {phaseItemId, editorId: mutatorId, isEditing}
    publish(SubscriptionChannel.MEETING, meetingId, 'EditReflectionPayload', data, subOptions)
    return data
  }
}
