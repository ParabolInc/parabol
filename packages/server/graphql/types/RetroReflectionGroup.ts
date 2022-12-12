import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import Reflection from '../../database/types/Reflection'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import {resolveForSU} from '../resolvers'
import CommentorDetails from './CommentorDetails'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import ReflectPrompt from './ReflectPrompt'
import RetroReflection from './RetroReflection'
import RetrospectiveMeeting from './RetrospectiveMeeting'
import Team from './Team'

const RetroReflectionGroup: GraphQLObjectType = new GraphQLObjectType<any, GQLContext>({
  name: 'RetroReflectionGroup',
  description: 'A reflection group created during the group phase of a retrospective',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    commentors: {
      type: new GraphQLList(new GraphQLNonNull(CommentorDetails)),
      description: 'A list of users currently commenting',
      deprecationReason: 'Moved to ThreadConnection. Can remove Jun-01-2021',
      resolve: ({commentor = []}) => {
        return commentor
      }
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The timestamp the meeting was created'
    },
    isActive: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'True if the group has not been removed, else false'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The foreign key to link a reflection group to its meeting'
    },
    meeting: {
      type: new GraphQLNonNull(RetrospectiveMeeting),
      description: 'The retrospective meeting this reflection was created in',
      resolve: ({meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    prompt: {
      type: new GraphQLNonNull(ReflectPrompt),
      resolve: ({promptId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('reflectPrompts').load(promptId)
      }
    },
    promptId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The foreign key to link a reflection group to its prompt. Immutable.'
    },
    reflections: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetroReflection))),
      resolve: async ({id: reflectionGroupId, meetingId}, _args: unknown, {dataLoader}) => {
        // use meetingId so we only hit the DB once instead of once per group
        const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
        const filteredReflections = reflections.filter(
          (reflection: Reflection) => reflection.reflectionGroupId === reflectionGroupId
        )
        filteredReflections.sort((a: Reflection, b: Reflection) =>
          a.sortOrder < b.sortOrder ? 1 : -1
        )
        return filteredReflections
      }
    },
    smartTitle: {
      type: GraphQLString,
      description: 'Our auto-suggested title, to be compared to the actual title for analytics',
      resolve: resolveForSU('smartTitle')
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order of the reflection group'
    },
    summary: {
      type: GraphQLString,
      description: `The GPT-3 generated summary of this reflection group`
    },
    team: {
      type: Team,
      description: 'The team that is running the retro',
      resolve: async ({meetingId}, _args: unknown, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        return dataLoader.get('teams').load(meeting.teamId)
      }
    },
    title: {
      type: GraphQLString,
      description: 'The title of the grouping of the retrospective reflections'
    },
    titleIsUserDefined: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if a user wrote the title, else false',
      resolve: ({title, smartTitle}) => {
        return title ? title !== smartTitle : false
      }
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting was updated at'
    },
    voterIds: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      description: 'A list of voterIds (userIds). Not available to team to preserve anonymity',
      resolve: resolveForSU('voterIds')
    },
    voteCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of votes this group has received',
      resolve: ({voterIds}) => {
        return voterIds ? voterIds.length : 0
      }
    },
    viewerVoteCount: {
      type: GraphQLInt,
      description: 'The number of votes the viewer has given this group',
      resolve: ({voterIds}, _args: unknown, {authToken}) => {
        const viewerId = getUserId(authToken)
        return voterIds
          ? voterIds.reduce(
              (sum: number, voterId: string) => (voterId === viewerId ? sum + 1 : sum),
              0
            )
          : 0
      }
    }
  })
})

export default RetroReflectionGroup
