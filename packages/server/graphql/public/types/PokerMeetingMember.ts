import {PokerMeetingMemberResolvers} from '../resolverTypes'

const PokerMeetingMember: PokerMeetingMemberResolvers = {
  __isTypeOf: ({meetingType}) => meetingType === 'poker'
}

export default PokerMeetingMember
