import {GraphQLBoolean, GraphQLObjectType} from 'graphql'
import {forwardConnectionArgs} from 'graphql-relay'
import connectionFromTasks from 'server/graphql/queries/helpers/connectionFromTasks'
import {resolveTeam} from 'server/graphql/resolvers'
import Assignee, {assigneeInterfaceFields} from 'server/graphql/types/Assignee'
import GraphQLEmailType from 'server/graphql/types/GraphQLEmailType'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import PossibleTeamMember from 'server/graphql/types/PossibleTeamMember'
import {TaskConnection} from 'server/graphql/types/Task'
import Team from 'server/graphql/types/Team'
import {getUserId} from 'server/utils/authorization'

const SoftTeamMember = new GraphQLObjectType({
  name: 'SoftTeamMember',
  description: 'A member of a team',
  interfaces: () => [PossibleTeamMember, Assignee],
  fields: () => ({
    ...assigneeInterfaceFields(),
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The datetime the team was created'
    },
    email: {
      type: GraphQLEmailType,
      description: 'The user email'
    },
    isActive: {
      type: GraphQLBoolean,
      description:
        'True if this is still a soft team member, false if they were rejected or became a team member'
    },
    tasks: {
      type: TaskConnection,
      description: 'Tasks owned by the team member',
      args: {
        ...forwardConnectionArgs,
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        }
      },
      resolve: async ({teamId, id: assigneeId, userId}, args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const allTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        const tasksForUserId = allTasks.filter((task) => task.assigneeId === assigneeId)
        const publicTasksForUserId =
          viewerId === userId
            ? tasksForUserId
            : tasksForUserId.filter((task) => !task.tags.includes('private'))
        return connectionFromTasks(publicTasksForUserId)
      }
    },
    team: {
      type: Team,
      description: 'The team this team member belongs to',
      resolve: resolveTeam
    }
  })
})

export default SoftTeamMember
