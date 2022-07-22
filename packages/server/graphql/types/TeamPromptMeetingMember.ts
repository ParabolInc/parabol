import {GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import MeetingMember, {meetingMemberFields} from './MeetingMember'

const TeamPromptMeetingMember = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamPromptMeetingMember',
  interfaces: () => [MeetingMember],
  description: 'All the meeting specifics for a user in a team prompt meeting',
  fields: () => ({
    ...meetingMemberFields()
    // TODO: add meeting member responses
  })
})

export default TeamPromptMeetingMember
