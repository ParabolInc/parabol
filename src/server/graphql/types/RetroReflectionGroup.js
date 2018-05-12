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
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import RetroReflection from 'server/graphql/types/RetroReflection'
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting'
import Team from 'server/graphql/types/Team'
import {resolveForSU} from 'server/graphql/resolvers'
import RetroPhaseItem from 'server/graphql/types/RetroPhaseItem'
import {getUserId} from 'server/utils/authorization'
import Task from 'server/graphql/types/Task'

const RetroReflectionGroup = new GraphQLObjectType({
  name: 'RetroReflectionGroup',
  description: 'A reflection created during the reflect phase of a retrospective',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'shortid'
    },
    createdAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting was created'
    },
    isActive: {
      type: GraphQLBoolean,
      description: 'True if the reflection was not removed, else false'
    },
    meetingId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The foreign key to link a reflection group to its meeting'
    },
    meeting: {
      type: RetrospectiveMeeting,
      description: 'The retrospective meeting this reflection was created in',
      resolve: ({meetingId}, args, {dataLoader}) => {
        return dataLoader.get('newMeetings').load(meetingId)
      }
    },
    phaseItem: {
      type: RetroPhaseItem,
      resolve: ({retroPhaseItemId}, args, {dataLoader}) => {
        return dataLoader.get('customPhaseItems').load(retroPhaseItemId)
      }
    },
    reflections: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetroReflection))),
      resolve: async ({id: reflectionGroupId, meetingId}, args, {dataLoader}) => {
        // use meetingId so we only hit the DB once instead of once per group
        const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
        const filteredReflections = reflections.filter(
          (reflection) => reflection.reflectionGroupId === reflectionGroupId
        )
        filteredReflections.sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
        return filteredReflections
      }
    },
    retroPhaseItemId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The foreign key to link a reflection group to its phaseItem. Immutable.'
    },
    smartTitle: {
      type: GraphQLString,
      description: 'Our auto-suggested title, to be compared to the actual title for analytics',
      resolve: resolveForSU('smartTitle')
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'The sort order of the reflection group in the phase item'
    },
    tasks: {
      type: new GraphQLNonNull(GraphQLList(GraphQLNonNull(Task))),
      description: 'The tasks created for this group in the discussion phase',
      resolve: async ({id: reflectionGroupId, meetingId}, args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {teamId} = meeting
        const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        return teamTasks.filter((task) => task.reflectionGroupId === reflectionGroupId)
      }
    },
    team: {
      type: Team,
      description: 'The team that is running the retro',
      resolve: async ({meetingId}, args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        return dataLoader.get('teams').load(meeting.teamId)
      }
    },
    title: {
      type: GraphQLString,
      description: 'The title of the grouping of the retrospective reflections'
    },
    titleIsUserDefined: {
      type: GraphQLBoolean,
      description: 'true if a user wrote the title, else false'
    },
    updatedAt: {
      type: GraphQLISO8601Type,
      description: 'The timestamp the meeting was updated at'
    },
    voterIds: {
      type: new GraphQLList(GraphQLID),
      description: 'A list of voterIds (userIds). Not available to team to preserve anonymity',
      resolve: resolveForSU('voterIds')
    },
    voteCount: {
      type: GraphQLInt,
      description: 'The number of votes this group has received',
      resolve: ({voterIds}) => {
        return voterIds ? voterIds.length : 0
      }
    },
    viewerVoteCount: {
      type: GraphQLInt,
      description: 'The number of votes the viewer has given this group',
      resolve: ({voterIds}, args, {authToken}) => {
        const viewerId = getUserId(authToken)
        return voterIds
          ? voterIds.reduce((sum, voterId) => (voterId === viewerId ? sum + 1 : sum), 0)
          : 0
      }
    }
  })
})

export default RetroReflectionGroup
