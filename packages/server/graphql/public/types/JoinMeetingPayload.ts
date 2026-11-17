import MeetingMemberId from 'parabol-client/shared/gqlIds/MeetingMemberId'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {augmentDBStage} from '../../resolvers'
import type {JoinMeetingPayloadResolvers} from '../resolverTypes'

export type JoinMeetingPayloadSource = {
  meetingId: string
  userId: string
}

const JoinMeetingPayload: JoinMeetingPayloadResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  },
  meetingMember: ({meetingId, userId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingMembers').loadNonNull(MeetingMemberId.join(meetingId, userId))
  },
  stages: async ({meetingId, userId}, _args, {dataLoader}) => {
    const {phases, teamId} = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const teamMemberId = toTeamMemberId(teamId, userId)
    return phases.flatMap(({phaseType, stages}) =>
      stages
        .filter((stage) => 'teamMemberId' in stage && stage.teamMemberId === teamMemberId)
        .map((stage) => augmentDBStage(stage, meetingId, phaseType, teamId))
    )
  }
}

export default JoinMeetingPayload
