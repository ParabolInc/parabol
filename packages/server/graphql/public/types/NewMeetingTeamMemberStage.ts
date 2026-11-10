import {positionAfter} from '../../../../client/shared/sortOrder'
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
    if (typeof sortOrder === 'string') return sortOrder
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    const phase = meeting.phases.find((phase) => phase.phaseType === phaseType)
    // a stage from before sortOrder existed has none, and goes right after the stage before it
    let previous = ''
    for (const stage of phase?.stages ?? []) {
      previous =
        'teamMemberId' in stage && stage.sortOrder ? stage.sortOrder : positionAfter(previous)
      if (stage.id === id) break
    }
    return previous
  }
}

export default NewMeetingTeamMemberStage
