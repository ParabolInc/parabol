import {GraphQLInt, GraphQLNonNull, GraphQLList, GraphQLObjectType} from 'graphql'
import MeetingMember, {meetingMemberFields} from 'server/graphql/types/MeetingMember'
import Task from 'server/graphql/types/Task'

const RetrospectiveMeetingMember = new GraphQLObjectType({
  name: 'RetrospectiveMeetingMember',
  interfaces: () => [MeetingMember],
  description: 'All the meeting specifics for a user in a retro meeting',
  fields: () => ({
    ...meetingMemberFields(),
    tasks: {
      type: new GraphQLNonNull(GraphQLList(GraphQLNonNull(Task))),
      description: 'The tasks assigned to members during the meeting',
      resolve: async ({meetingId, userId}, args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {teamId} = meeting
        const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        return teamTasks.filter((task) => task.meetingId === meetingId && task.userId === userId)
      }
    },
    votesRemaining: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  })
})

export default RetrospectiveMeetingMember
