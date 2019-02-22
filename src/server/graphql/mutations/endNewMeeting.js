import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from 'server/database/rethinkDriver'
import {getUserId, isTeamMember} from 'server/utils/authorization'
import publish from 'server/utils/publish'
import {NOTIFICATION, TEAM} from 'universal/utils/constants'
import EndNewMeetingPayload from 'server/graphql/types/EndNewMeetingPayload'
import sendSegmentEvent from 'server/utils/sendSegmentEvent'
import {endSlackMeeting} from 'server/graphql/mutations/helpers/notifySlack'
import sendNewMeetingSummary from 'server/graphql/mutations/helpers/endMeeting/sendNewMeetingSummary'
import shortid from 'shortid'
import {COMPLETED_RETRO_MEETING} from 'server/graphql/types/TimelineEventTypeEnum'
import removeSuggestedAction from 'server/safeMutations/removeSuggestedAction'
import standardError from 'server/utils/standardError'

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
    const viewerId = getUserId(authToken)
    // AUTH
    const meeting = await r
      .table('NewMeeting')
      .get(meetingId)
      .default(null)
    if (!meeting) return standardError(new Error('Meeting not found'), {userId: viewerId})
    const {endedAt, meetingNumber, phases, teamId} = meeting
    // called by endOldMeetings, SU is OK
    if (!isTeamMember(authToken, teamId) && authToken.rol !== 'su') {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }
    if (endedAt) return standardError(new Error('Meeting already ended'), {userId: viewerId})

    // RESOLUTION
    const lastPhase = phases[phases.length - 1]
    const currentStage = lastPhase.stages.find((stage) => stage.startAt && !stage.endAt)

    if (currentStage) {
      currentStage.isComplete = true
      currentStage.endAt = now
    }

    const {completedMeeting, team} = await r({
      team: r
        .table('Team')
        .get(teamId)
        .update(
          {
            meetingId: null
          },
          {returnChanges: true}
        )('changes')(0)('new_val'),
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

    if (currentStage) {
      sendSegmentEvent('Retro Meeting Completed', presentMemberUserIds, {
        teamId,
        meetingNumber
      })
      sendNewMeetingSummary(completedMeeting, dataLoader)
      const events = meetingMembers.map((meetingMember) => ({
        id: shortid.generate(),
        createdAt: now,
        interactionCount: 0,
        seenCount: 0,
        type: COMPLETED_RETRO_MEETING,
        userId: meetingMember.userId,
        teamId,
        orgId: team.orgId,
        meetingId
      }))
      await r.table('TimelineEvent').insert(events)
      if (team.isOnboardTeam) {
        const teamLeadUserId = await r
          .table('TeamMember')
          .getAll(teamId, {index: 'teamId'})
          .filter({isLead: true})
          .nth(0)('userId')

        const removedSuggestedActionId = await removeSuggestedAction(
          teamLeadUserId,
          'tryRetroMeeting'
        )
        if (removedSuggestedActionId) {
          publish(
            NOTIFICATION,
            teamLeadUserId,
            EndNewMeetingPayload,
            {removedSuggestedActionId},
            subOptions
          )
        }
      }
    }

    const data = {meetingId, teamId, isKill: !currentStage}
    publish(TEAM, teamId, EndNewMeetingPayload, data, subOptions)
    return data
  }
}
