import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import EditReflectionPayload from '../types/EditReflectionPayload'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {REFLECT, TEAM} from '../../../client/utils/constants'
import isPhaseComplete from '../../../client/utils/meetings/isPhaseComplete'
import standardError from '../../utils/standardError'

export default {
  description: 'Changes the editing state of a user for a phase item',
  type: EditReflectionPayload,
  args: {
    phaseItemId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    isEditing: {
      description: 'Whether a phaseItem is being edited or not',
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  },
  async resolve (source, {phaseItemId, isEditing}, {authToken, dataLoader, socketId: mutatorId}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {operationId, mutatorId}
    const viewerId = getUserId(authToken)

    // AUTH
    const phaseItem = await r.table('CustomPhaseItem').get(phaseItemId)
    if (!phaseItem || !phaseItem.isActive) {
      return standardError(new Error('Category not found'), {userId: viewerId})
    }
    const {teamId} = phaseItem
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    const team = await r.table('Team').get(teamId)
    const {meetingId} = team
    if (!meetingId) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, phases} = meeting
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})
    if (isPhaseComplete(REFLECT, phases)) {
      return standardError(new Error('Meeting phase already completed'), {userId: viewerId})
    }

    // RESOLUTION
    const data = {phaseItemId, editorId: mutatorId, isEditing}
    publish(TEAM, teamId, EditReflectionPayload, data, subOptions)
    return data
  }
}
