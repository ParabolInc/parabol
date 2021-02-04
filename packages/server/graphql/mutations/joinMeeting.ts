import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {MeetingTypeEnum, NewMeetingPhaseTypeEnum} from '../../../client/types/graphql'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import rMapIf from '../../database/rMapIf'
import ActionMeetingMember from '../../database/types/ActionMeetingMember'
import CheckInPhase from '../../database/types/CheckInPhase'
import CheckInStage from '../../database/types/CheckInStage'
import Meeting from '../../database/types/Meeting'
import MeetingRetrospective from '../../database/types/MeetingRetrospective'
import PokerMeetingMember from '../../database/types/PokerMeetingMember'
import RetroMeetingMember from '../../database/types/RetroMeetingMember'
import UpdatesPhase from '../../database/types/UpdatesPhase'
import UpdatesStage from '../../database/types/UpdatesStage'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import {GQLContext} from '../graphql'
import JoinMeetingPayload from '../types/JoinMeetingPayload'

const createMeetingMember = (meeting: Meeting, teamId: string, userId: string) => {
  switch (meeting.meetingType) {
    case MeetingTypeEnum.action:
      return new ActionMeetingMember({teamId, userId, meetingId: meeting.id})
    case MeetingTypeEnum.retrospective:
      const {id: meetingId, totalVotes} = meeting as MeetingRetrospective
      return new RetroMeetingMember({
        teamId,
        userId,
        meetingId,
        votesRemaining: totalVotes
      })
    case MeetingTypeEnum.poker:
      return new PokerMeetingMember({
        teamId,
        userId,
        meetingId: meeting.id
      })
    default:
      throw new Error('Invalid meeting type')
  }
}

const joinMeeting = {
  type: GraphQLNonNull(JoinMeetingPayload),
  description: `Create a meeting member for a user`,
  args: {
    meetingId: {
      type: GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (
    _source,
    {meetingId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const viewerId = getUserId(authToken)
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    console.log('joining Meeting')
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
    const meetingMember = createMeetingMember(meeting, teamId, viewerId)
    const res1 = await r
      .table('MeetingMember')
      .insert(meetingMember)
      .run()
    console.log({res1})
    const {errors} = res1
    // if this is called concurrently, only 1 will be error free
    if (errors > 0) {
      return {error: {message: 'Already joined meeting'}}
    }

    const teamMemberId = toTeamMemberId(teamId, viewerId)
    const mapIf = rMapIf(r)

    const addStageToPhase = (
      stage: CheckInStage | UpdatesStage,
      phaseType: NewMeetingPhaseTypeEnum
    ) => {
      console.log('adding stage to', phaseType)
      return r
        .table('NewMeeting')
        .get(meetingId)
        .update((meeting) => ({
          phases: mapIf(
            meeting('phases'),
            (phase) => phase('phaseType').eq(phaseType),
            (phase) =>
              phase.merge({
                stages: phase('stages').append({
                  ...stage,
                  // this is a departure from before. Let folks move ahead while the check-in is going on!
                  isNavigable: true,
                  isNavigableByFacilitator: true,
                  // the stage is complete if all other stages are complete & there's at least 1
                  isComplete: r.and(
                    phase('stages')('isComplete')
                      .contains(false)
                      .not(),
                    phase('stages')
                      .count()
                      .ge(1)
                  )
                })
              })
          )
        }))
        .run()
    }

    const appendToCheckin = async () => {
      const checkInPhase = phases.find(
        (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.checkin
      ) as CheckInPhase
      if (!checkInPhase) return
      const checkInStage = new CheckInStage(teamMemberId)
      return addStageToPhase(checkInStage, NewMeetingPhaseTypeEnum.checkin)
    }

    const appendToUpdate = async () => {
      const updatesPhase = phases.find(
        (phase) => phase.phaseType === NewMeetingPhaseTypeEnum.updates
      ) as UpdatesPhase
      if (!updatesPhase) return
      const updatesStage = new UpdatesStage(teamMemberId)
      return addStageToPhase(updatesStage, NewMeetingPhaseTypeEnum.updates)
    }

    // effort is taken here to run both at the same time
    // so e.g.the 5th person in check-in is the 5th person in updates
    await Promise.all([appendToCheckin(), appendToUpdate()])

    const data = {meetingId}
    publish(SubscriptionChannel.MEETING, meetingId, 'JoinMeetingSuccess', data, subOptions)
    return data
  }
}

export default joinMeeting
