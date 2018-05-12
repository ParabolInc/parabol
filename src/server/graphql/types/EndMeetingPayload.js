import {GraphQLList, GraphQLObjectType} from 'graphql'
import {resolveMeeting, resolveTeam} from 'server/graphql/resolvers'
import Team from 'server/graphql/types/Team'
import Task from 'server/graphql/types/Task'
import Meeting from 'server/graphql/types/Meeting'
import StandardMutationError from 'server/graphql/types/StandardMutationError'

const EndMeetingPayload = new GraphQLObjectType({
  name: 'EndMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    team: {
      type: Team,
      resolve: resolveTeam
    },
    archivedTasks: {
      type: new GraphQLList(Task),
      description: 'The list of tasks that were archived during the meeting'
    },
    meeting: {
      type: Meeting,
      resolve: resolveMeeting
    }
  })
})

export default EndMeetingPayload
