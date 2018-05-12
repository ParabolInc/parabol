import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {TEAM} from 'universal/utils/constants'
import {sendTeamAccessError} from 'server/utils/authorizationErrors'
import EndNewMeetingPayload from 'server/graphql/types/EndNewMeetingPayload'
import {sendMeetingNotFoundError} from 'server/utils/docNotFoundErrors'
import {sendAlreadyEndedMeetingError} from 'server/utils/alreadyMutatedErrors'
import sendSegmentEvent from 'server/utils/sendSegmentEvent'
import {endSlackMeeting} from 'server/graphql/mutations/helpers/notifySlack'
import sendNewMeetingSummary from 'server/graphql/mutations/helpers/endMeeting/sendNewMeetingSummary'

export default {
  type: EndNewMeetingPayload,
  description: 'Finish a new meeting abruptly',
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The meeting to end'
    }
  },
  async resolve (source, {meetingId}, {authToken, socketId: mutatorId, dataLoader}) {
    const r = getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const now = new Date()
    // AUTH
    const meeting = await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
    if (!meeting) return sendMeetingNotFoundError(authToken, meetingId)
    const {endedAt, meetingNumber, phases, teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      return sendTeamAccessError(authToken, teamId)
    }
    if (endedAt) return sendAlreadyEndedMeetingError(authToken, meetingId)

    const lastPhase = phases[phases.length - 1]
    const lastPhaseFirstStage = lastPhase.stages[0]
    const lastPhaseStarted = Boolean(lastPhaseFirstStage.startAt)

    if (lastPhaseStarted) {
      const currentStage = lastPhase.stages.find((stage) => stage.startAt && !stage.endAt)
      if (currentStage) {
        currentStage.isComplete = true
        currentStage.endAt = now
      }
    }

    // RESOLUTION
    const {completedMeeting} = await r({
      team: r
        .table('Team')
        .get(teamId)
        .update({
          meetingId: null
        }),
      completedMeeting: r
        .table('NewMeeting')
        .get(meetingId)
        .update(
          {
            endedAt: now,
            phases
          },
          {returnChanges: true}
        )('changes')(0)('new_val')
    })

    const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
    const presentMembers = meetingMembers.filter(
      (meetingMember) => meetingMember.isCheckedIn === true
    )
    const presentMemberUserIds = presentMembers.map(({userId}) => userId)
    endSlackMeeting(meetingId, teamId, true)

    if (lastPhaseStarted) {
      sendSegmentEvent('Retro Meeting Completed', presentMemberUserIds, {
        teamId,
        meetingNumber
      })
      // TODO create summary and reactivate this if minimum phases complete
      await sendNewMeetingSummary(completedMeeting, dataLoader)
    }

    const data = {meetingId, teamId, isKill: !lastPhaseStarted}
    publish(TEAM, teamId, EndNewMeetingPayload, data, subOptions)
    return data
  }
}
