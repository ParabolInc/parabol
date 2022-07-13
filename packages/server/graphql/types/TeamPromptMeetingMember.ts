import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import {GQLContext} from '../graphql'
import MeetingMember, {meetingMemberFields} from './MeetingMember'
import Task from './Task'

const TeamPromptMeetingMember = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamPromptMeetingMember',
  interfaces: () => [MeetingMember],
  description: 'All the meeting specifics for a user in a team prompt meeting',
  fields: () => ({
    ...meetingMemberFields(),
    tasks: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Task))),
      description: 'The tasks assigned to members during the meeting',
      resolve: async ({meetingId, userId}, _args: unknown, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {teamId} = meeting
        const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        return teamTasks.filter((task) => {
          if (task.meetingId !== meetingId) return false
          if (task.userId !== userId) return false
          if (isTaskPrivate(task.tags)) return false
          return true
        })
      }
    }
  })
})

export default TeamPromptMeetingMember
