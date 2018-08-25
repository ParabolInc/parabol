import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import EditReflectionPayload from 'server/graphql/types/EditReflectionPayload'
import {isTeamMember} from 'server/utils/authorization'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import {sendMeetingNotFoundError, sendPhaseItemNotFoundError} from 'server/utils/docNotFoundErrors'
import publish from 'server/utils/publish'
import {REFLECT, TEAM} from 'universal/utils/constants'
import {
  sendAlreadyCompletedMeetingPhaseError,
  sendAlreadyEndedMeetingError
} from 'server/utils/alreadyMutatedErrors'
import isPhaseComplete from 'universal/utils/meetings/isPhaseComplete'

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

    // AUTH
    const phaseItem = await r.table('CustomPhaseItem').get(phaseItemId)
    if (!phaseItem || !phaseItem.isActive) {
      return sendPhaseItemNotFoundError(authToken, phaseItemId)
    }
    const {teamId} = phaseItem
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }

    const team = await r.table('Team').get(teamId)
    const {meetingId} = team
    if (!meetingId) return sendAlreadyEndedMeetingError(authToken, meetingId)
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId)
    const {endedAt, phases} = meeting
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId)
    if (isPhaseComplete(REFLECT, phases)) {
      return sendAlreadyCompletedMeetingPhaseError(authToken, REFLECT)
    }

    // RESOLUTION
    const data = {phaseItemId, editorId: mutatorId, isEditing}
    publish(TEAM, teamId, EditReflectionPayload, data, subOptions)
    return data
  }
}
