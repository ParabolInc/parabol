import {GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {resolveNewMeeting} from '../resolvers'
import Team from './Team'
import NewMeeting from './NewMeeting'
import {GQLContext} from '../graphql'
import TimelineEvent from './TimelineEvent'
import makeMutationPayload from './makeMutationPayload'

export const EndRetrospectiveSuccess = new GraphQLObjectType<any, GQLContext>({
  name: 'EndRetrospectiveSuccess',
  fields: () => ({
    isKill: {
      type: GraphQLBoolean,
      description: 'true if the meeting was killed (ended before reaching last stage)'
    },
    team: {
      type: GraphQLNonNull(Team),
      resolve: ({teamId}, _args, {dataLoader}) => {
        return teamId ? dataLoader.get('teams').load(teamId) : null
      }
    },
    meeting: {
      type: GraphQLNonNull(NewMeeting),
      resolve: resolveNewMeeting
    },
    removedSuggestedActionId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'The ID of the suggestion to try a retro meeting, if tried'
    },
    removedTaskIds: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID)))
    },
    timelineEvent: {
      type: GraphQLNonNull(TimelineEvent),
      description: 'An event that is important to the viewer, e.g. an ended meeting',
      resolve: async ({timelineEventId}, _args, {dataLoader}) => {
        return await dataLoader.get('timelineEvents').load(timelineEventId)
      }
    }
    // updatedTaskIds: {
    //   type: new GraphQLList(new GraphQLNonNull(GraphQLID))
    // },
    // updatedTasks: {
    //   type: new GraphQLList(new GraphQLNonNull(Task)),
    //   description: 'Any tasks that were updated during the meeting',
    //   resolve: async ({updatedTaskIds}, _args, {authToken, dataLoader}) => {
    //     if (!updatedTaskIds) return []
    //     const viewerId = getUserId(authToken)
    //     const allUpdatedTasks = await dataLoader.get('tasks').loadMany(updatedTaskIds)
    //     return allUpdatedTasks.filter((task) => {
    //       return isTaskPrivate(task.tags) ? task.userId === viewerId : true
    //     })
    //   }
    // }
  })
})

const EndRetrospectivePayload = makeMutationPayload(
  'EndRetrospectivePayload',
  EndRetrospectiveSuccess
)

export default EndRetrospectivePayload
