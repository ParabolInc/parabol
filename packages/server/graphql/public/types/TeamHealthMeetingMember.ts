import type {TeamHealthMeetingMemberResolvers} from '../resolverTypes'

const TeamHealthMeetingMember: TeamHealthMeetingMemberResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'teamHealth',
  // the column is shared with poker & nullable for members created before team health used it
  isSpectating: ({isSpectating}) => !!isSpectating
}

export default TeamHealthMeetingMember
