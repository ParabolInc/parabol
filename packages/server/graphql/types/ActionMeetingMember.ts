import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import getRethink from '../../database/rethinkDriver'
import {RDatum} from '../../database/stricterR'
import {GQLContext} from '../graphql'
import MeetingMember, {meetingMemberFields} from './MeetingMember'
import Task from './Task'

const ActionMeetingMember = new GraphQLObjectType<any, GQLContext>({
  name: 'ActionMeetingMember',
  interfaces: () => [MeetingMember],
  description: 'All the meeting specifics for a user in a action meeting',
  fields: () => ({
    ...meetingMemberFields(),
    doneTasks: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Task))),
      description: 'The tasks marked as done in the meeting',
      resolve: async ({meetingId, userId}) => {
        const r = await getRethink()
        return r
          .table('Task')
          .getAll(userId, {index: 'userId'})
          .filter({doneMeetingId: meetingId})
          .filter((task: RDatum) => task('tags').contains('private').not())
          .run()
      }
    },
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

export default ActionMeetingMember
