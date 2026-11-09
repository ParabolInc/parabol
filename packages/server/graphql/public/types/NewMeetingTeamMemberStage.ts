import fromTeamMemberId from '../../../../client/utils/relay/fromTeamMemberId'
import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import type {NewMeetingTeamMemberStageResolvers} from '../resolverTypes'

const NewMeetingTeamMemberStage: NewMeetingTeamMemberStageResolvers = {
  meetingMember: async ({meetingId, teamMemberId}, _args, {dataLoader}) => {
    const {userId} = fromTeamMemberId(teamMemberId)
    const meetingMemberId = toTeamMemberId(meetingId, userId)
    return dataLoader.get('meetingMembers').loadNonNull(meetingMemberId)
  },
  teamMember: async ({teamMemberId}, _args, {dataLoader}) => {
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  },
  sortOrder: async ({id, meetingId, phaseType, sortOrder}, _args, {dataLoader}) => {
    // a stage from before sortOrder existed has none, and is ordered by its position
    if (typeof sortOrder === 'number') return sortOrder
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const phase = meeting.phases.find((phase) => phase.phaseType === phaseType)
    return phase?.stages.findIndex((stage) => stage.id === id) ?? 0
  }
}

export default NewMeetingTeamMemberStage
