import {GraphQLObjectType} from 'graphql'
import {IRetrospectiveMeetingMember} from 'parabol-client/types/graphql'
import {GQLContext} from '../graphql'
import MeetingMember, {meetingMemberFields} from './MeetingMember'

const PokerMeetingMember = new GraphQLObjectType<IRetrospectiveMeetingMember, GQLContext>({
  name: 'PokerMeetingMember',
  interfaces: () => [MeetingMember],
  description: 'All the meeting specifics for a user in a poker meeting',
  fields: () => ({
    ...meetingMemberFields()
  })
})

export default PokerMeetingMember
