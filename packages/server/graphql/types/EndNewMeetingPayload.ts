import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveNewMeeting} from 'server/graphql/resolvers'
import Team from 'server/graphql/types/Team'
import Task from 'server/graphql/types/Task'
import StandardMutationError from 'server/graphql/types/StandardMutationError'
import NewMeeting from 'server/graphql/types/NewMeeting'
import {GQLContext} from 'server/graphql/graphql'
import {getUserId} from 'server/utils/authorization'
import isTaskPrivate from 'universal/utils/isTaskPrivate'

const EndNewMeetingPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'EndNewMeetingPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    isKill: {
      type: GraphQLBoolean,
      description: 'true if the meeting was killed (ended before reaching last stage)'
    },
    team: {
      type: Team,
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader.get('teams').load(teamId)
      }
    },
    meeting: {
      type: NewMeeting,
      resolve: resolveNewMeeting
    },
    removedSuggestedActionId: {
      type: GraphQLID,
      description: 'The ID of the suggestion to try a retro meeting, if tried'
    },
    updatedTaskIds: {
      type: new GraphQLList(new GraphQLNonNull(GraphQLID))
    },
    updatedTasks: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Task))),
      description: 'Any tasks that were updated during the meeting',
      resolve: async ({updatedTaskIds}, _args, {authToken, dataLoader}) => {
        if (!updatedTaskIds) return []
        const viewerId = getUserId(authToken)
        const allUpdatedTasks = await dataLoader.get('tasks').loadMany(updatedTaskIds)
        return allUpdatedTasks.filter((task) => {
          return isTaskPrivate(task.tags) ? task.userId === viewerId : true
        })
      }
    }
  })
})

export default EndNewMeetingPayload
