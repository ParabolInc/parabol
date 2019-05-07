import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from 'server/graphql/graphql'
import MeetingMember, {meetingMemberFields} from 'server/graphql/types/MeetingMember'
import Task from 'server/graphql/types/Task'
import {IActionMeetingMember} from 'universal/types/graphql'

const ActionMeetingMember = new GraphQLObjectType<IActionMeetingMember, GQLContext>({
  name: 'ActionMeetingMember',
  interfaces: () => [MeetingMember],
  description: 'All the meeting specifics for a user in a retro meeting',
  fields: () => ({
    ...meetingMemberFields(),
    tasks: {
      type: new GraphQLNonNull(GraphQLList(GraphQLNonNull(Task))),
      description: 'The tasks assigned to members during the meeting',
      resolve: async ({meetingId, userId}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {teamId} = meeting
        const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        return teamTasks.filter(
          (task) =>
            task.meetingId === meetingId && task.userId === userId && !task.tags.includes('private')
        )
      }
    }
  })
})

export default ActionMeetingMember
