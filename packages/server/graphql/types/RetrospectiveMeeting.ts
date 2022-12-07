import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import ReflectionGroupType from '../../database/types/ReflectionGroup'
import RetroMeetingMember from '../../database/types/RetroMeetingMember'
import {getUserId} from '../../utils/authorization'
import filterTasksByMeeting from '../../utils/filterTasksByMeeting'
import getPhase from '../../utils/getPhase'
import {GQLContext} from '../graphql'
import {resolveForSU} from '../resolvers'
import NewMeeting, {newMeetingFields} from './NewMeeting'
import RetroReflectionGroup from './RetroReflectionGroup'
import RetrospectiveMeetingMember from './RetrospectiveMeetingMember'
import RetrospectiveMeetingSettings from './RetrospectiveMeetingSettings'
import Task from './Task'

const ReflectionGroupSortEnum = new GraphQLEnumType({
  name: 'ReflectionGroupSortEnum',
  description:
    'sorts for the reflection group. default is sortOrder. sorting by voteCount filters out items without votes.',
  values: {
    voteCount: {},
    stageOrder: {}
  }
})

const RetrospectiveMeeting: GraphQLObjectType<any, GQLContext> = new GraphQLObjectType<
  any,
  GQLContext
>({
  name: 'RetrospectiveMeeting',
  interfaces: () => [NewMeeting],
  description: 'A retrospective meeting',
  fields: () => ({
    ...newMeetingFields(),
    autoGroupThreshold: {
      type: GraphQLFloat,
      description:
        'the threshold used to achieve the autogroup. Useful for model tuning. Serves as a flag if autogroup was used.',
      resolve: resolveForSU('autoGroupThreshold')
    },
    commentCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of comments generated in the meeting',
      resolve: ({commentCount}) => commentCount || 0
    },
    maxVotesPerGroup: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'the number of votes allowed for each participant to cast on a single group'
    },
    disableAnonymity: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Disables anonymity of reflections',
      resolve: ({disableAnonymity}) => disableAnonymity ?? false
    },
    meetingMembers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetrospectiveMeetingMember))),
      description: 'The team members that were active during the time of the meeting',
      resolve: ({id: meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('meetingMembersByMeetingId').load(meetingId)
      }
    },
    nextAutoGroupThreshold: {
      type: GraphQLFloat,
      description:
        'the next smallest distance threshold to guarantee at least 1 more grouping will be achieved'
    },
    reflectionCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of reflections generated in the meeting',
      resolve: ({reflectionCount}) => reflectionCount || 0
    },
    reflectionGroup: {
      type: RetroReflectionGroup,
      description: 'a single reflection group',
      args: {
        reflectionGroupId: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: async ({id: meetingId}, {reflectionGroupId}, {dataLoader}) => {
        const reflectionGroup = await dataLoader
          .get('retroReflectionGroups')
          .load(reflectionGroupId)
        if (reflectionGroup.meetingId !== meetingId) return null
        return reflectionGroup
      }
    },
    reflectionGroups: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetroReflectionGroup))),
      description: 'The grouped reflections',
      args: {
        sortBy: {
          type: ReflectionGroupSortEnum
        }
      },
      resolve: async ({id: meetingId}, {sortBy}, {dataLoader}) => {
        const reflectionGroups = await dataLoader
          .get('retroReflectionGroupsByMeetingId')
          .load(meetingId)
        if (sortBy === 'voteCount') {
          reflectionGroups.sort((a: ReflectionGroupType, b: ReflectionGroupType) =>
            a.voterIds.length < b.voterIds.length ? 1 : -1
          )
          return reflectionGroups
        } else if (sortBy === 'stageOrder') {
          const meeting = await dataLoader.get('newMeetings').load(meetingId)
          const {phases} = meeting
          const discussPhase = getPhase(phases, 'discuss')
          if (!discussPhase) return reflectionGroups
          const {stages} = discussPhase
          // for early terminations the stages may not exist
          const sortLookup = {} as {[reflectionGroupId: string]: number}
          reflectionGroups.forEach((group: ReflectionGroupType) => {
            const idx = stages.findIndex((stage) => stage.reflectionGroupId === group.id)
            sortLookup[group.id] = idx
          })
          reflectionGroups.sort((a: ReflectionGroupType, b: ReflectionGroupType) => {
            return sortLookup[a.id]! < sortLookup[b.id]! ? -1 : 1
          })
          return reflectionGroups
        }
        reflectionGroups.sort((a: ReflectionGroupType, b: ReflectionGroupType) =>
          a.sortOrder < b.sortOrder ? -1 : 1
        )
        return reflectionGroups
      }
    },
    settings: {
      type: new GraphQLNonNull(RetrospectiveMeetingSettings),
      description: 'The settings that govern the retrospective meeting',
      resolve: async ({teamId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('meetingSettingsByType').load({teamId, meetingType: 'retrospective'})
      }
    },
    summary: {
      type: GraphQLString,
      description: `The GPT-3 generated summary of all the comments, tasks, and reflections in the retro meeting. Undefined if the user doesnt have access to the feature`
    },
    taskCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of tasks generated in the meeting',
      resolve: ({taskCount}) => taskCount || 0
    },
    tasks: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Task))),
      description: 'The tasks created within the meeting',
      resolve: async ({id: meetingId}, _args: unknown, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {teamId} = meeting
        const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        return filterTasksByMeeting(teamTasks, meetingId, viewerId)
      }
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID)
    },
    templateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The ID of the template used for the meeting'
    },
    topicCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of topics generated in the meeting',
      resolve: ({topicCount}) => topicCount || 0
    },
    totalVotes: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'the total number of votes allowed for each participant'
    },
    votesRemaining: {
      type: new GraphQLNonNull(GraphQLInt),
      description:
        'The sum total of the votes remaining for the meeting members that are present in the meeting',
      resolve: async ({id: meetingId}, _args: unknown, {dataLoader}) => {
        const meetingMembers = (await dataLoader
          .get('meetingMembersByMeetingId')
          .load(meetingId)) as RetroMeetingMember[]
        return meetingMembers.reduce((sum, member) => sum + member.votesRemaining, 0)
      }
    },
    viewerMeetingMember: {
      type: RetrospectiveMeetingMember,
      description: 'The retrospective meeting member of the viewer',
      resolve: async ({id: meetingId}, _args: unknown, {authToken, dataLoader}: GQLContext) => {
        const viewerId = getUserId(authToken)
        const meetingMemberId = toTeamMemberId(meetingId, viewerId)
        const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
        return meetingMember || null
      }
    }
  })
})

export default RetrospectiveMeeting
