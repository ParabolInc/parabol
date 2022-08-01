import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import rMapIf from '../../database/rMapIf'
import ActionMeetingMember from '../../database/types/ActionMeetingMember'
import CheckInStage from '../../database/types/CheckInStage'
import {NewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import Meeting from '../../database/types/Meeting'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import PokerMeetingMember from '../../database/types/PokerMeetingMember'
import RetroMeetingMember from '../../database/types/RetroMeetingMember'
import TeamMember from '../../database/types/TeamMember'
import TeamPromptMeetingMember from '../../database/types/TeamPromptMeetingMember'
import TeamPromptResponseStage from '../../database/types/TeamPromptResponseStage'
import UpdatesStage from '../../database/types/UpdatesStage'
import insertDiscussions from '../../postgres/queries/insertDiscussions'
import {analytics} from '../../utils/analytics/analytics'
import {getUserId, isTeamMember} from '../../utils/authorization'
import getPhase from '../../utils/getPhase'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import JoinMeetingPayload from '../types/JoinMeetingPayload'

const createMeetingMember = (meeting: Meeting, teamMember: TeamMember) => {
  const {userId, teamId, isSpectatingPoker} = teamMember
  switch (meeting.meetingType) {
    case 'action':
      return new ActionMeetingMember({teamId, userId, meetingId: meeting.id})
    case 'retrospective':
      const {id: meetingId, totalVotes} = meeting as MeetingRetrospective
      return new RetroMeetingMember({
        teamId,
        userId,
        meetingId,
        votesRemaining: totalVotes
      })
    case 'poker':
      return new PokerMeetingMember({
        teamId,
        userId,
        meetingId: meeting.id,
        isSpectating: isSpectatingPoker
      })
    case 'teamPrompt':
      return new TeamPromptMeetingMember({teamId, userId, meetingId: meeting.id})
    default:
      throw new Error('Invalid meeting type')
  }
}

const joinMeeting = {
  type: new GraphQLNonNull(JoinMeetingPayload),
  description: `Create a meeting member for a user`,
  args: {
    meetingId: {
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source: unknown,
    {meetingId}: {meetingId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    //AUTH
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) {
      return {error: {message: 'Invalid meeting ID'}}
    }
    const {endedAt, teamId, phases} = meeting
    if (endedAt) {
      return {error: {message: 'Meeting has already ended'}}
    }
    if (!isTeamMember(authToken, teamId)) {
      return {error: {message: 'Not on the team'}}
    }
    const teamMemberId = toTeamMemberId(teamId, viewerId)
    const teamMember = await dataLoader.get('teamMembers').load(teamMemberId)
    const meetingMember = createMeetingMember(meeting, teamMember)
    const {errors} = await r.table('MeetingMember').insert(meetingMember).run()
    // if this is called concurrently, only 1 will be error free
    if (errors > 0) {
      return {error: {message: 'Already joined meeting'}}
    }

    const mapIf = rMapIf(r)

    const addStageToPhase = (
      stage: CheckInStage | UpdatesStage | TeamPromptResponseStage,
      phaseType: NewMeetingPhaseTypeEnum
    ) => {
      return r
        .table('NewMeeting')
        .get(meetingId)
        .update((meeting: any) => ({
          phases: mapIf(
            meeting('phases'),
            (phase: any) => phase('phaseType').eq(phaseType),
            (phase: any) =>
              phase.merge({
                stages: phase('stages').append({
                  ...stage,
                  // this is a departure from before. Let folks move ahead while the check-in is going on!
                  isNavigable: true,
                  isNavigableByFacilitator: true,
                  // the stage is complete if all other stages are complete & there's at least 1
                  isComplete: r.and(
                    phase('stages')('isComplete').contains(false).not(),
                    phase('stages').count().ge(1)
                  )
                })
              })
          )
        }))
        .run()
    }

    const appendToCheckin = async () => {
      const checkInPhase = getPhase(phases, 'checkin')
      if (!checkInPhase) return
      const checkInStage = new CheckInStage(teamMemberId)
      return addStageToPhase(checkInStage, 'checkin')
    }

    const appendToUpdate = async () => {
      const updatesPhase = getPhase(phases, 'updates')
      if (!updatesPhase) return
      const updatesStage = new UpdatesStage(teamMemberId)
      return addStageToPhase(updatesStage, 'updates')
    }

    const appendToTeamPromptResponses = async () => {
      const responsesPhase = getPhase(phases, 'RESPONSES')
      if (!responsesPhase) return
      const teamMemberResponseStage = responsesPhase.stages.find(
        (stage) => stage.teamMemberId === teamMemberId
      )
      // only add a new stage for the new users (ie. invited to the team after the meeting was started)
      if (teamMemberResponseStage) return
      const responsesStage = new TeamPromptResponseStage({teamMemberId})
      await insertDiscussions([
        {
          id: responsesStage.discussionId,
          teamId,
          meetingId,
          discussionTopicId: teamMemberId,
          discussionTopicType: 'teamPromptResponse' as const
        }
      ])
      return addStageToPhase(responsesStage, 'RESPONSES')
    }

    // effort is taken here to run both at the same time
    // so e.g.the 5th person in check-in is the 5th person in updates
    await Promise.all([appendToCheckin(), appendToUpdate(), appendToTeamPromptResponses()])
    dataLoader.get('newMeetings').clear(meetingId)

    const data = {meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'JoinMeetingSuccess', data, subOptions)
    analytics.meetingJoined(viewerId, meeting)
    return data
  }
}

export default joinMeeting
