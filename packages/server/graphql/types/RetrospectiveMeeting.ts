import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType
} from 'graphql'
import NewMeeting, {newMeetingFields} from './NewMeeting'
import RetroReflectionGroup from './RetroReflectionGroup'
import {resolveForSU} from '../resolvers'
import RetrospectiveMeetingSettings from './RetrospectiveMeetingSettings'
import {RETROSPECTIVE} from '../../../client/utils/constants'
import Task from './Task'
import {getUserId} from '../../utils/authorization'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import RetrospectiveMeetingMember from './RetrospectiveMeetingMember'
import filterTasksByMeeting from '../../utils/filterTasksByMeeting'
import {GQLContext} from '../graphql'

const ReflectionGroupSortEnum = new GraphQLEnumType({
  name: 'ReflectionGroupSortEnum',
  description:
    'sorts for the reflection group. default is sortOrder. sorting by voteCount filters out items without votes.',
  values: {
    voteCount: {}
  }
})

const RetrospectiveMeeting = new GraphQLObjectType<any, GQLContext>({
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
    meetingMembers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetrospectiveMeetingMember))),
      description: 'The team members that were active during the time of the meeting',
      resolve: ({id: meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('meetingMembersByMeetingId').load(meetingId)
      }
    },
    nextAutoGroupThreshold: {
      type: GraphQLFloat,
      description:
        'the next smallest distance threshold to guarantee at least 1 more grouping will be achieved'
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
          const groupsWithVotes = reflectionGroups.filter(({voterIds}) => voterIds.length > 0)
          groupsWithVotes.sort((a, b) => (a.voterIds.length < b.voterIds.length ? 1 : -1))
          return groupsWithVotes
        }
        reflectionGroups.sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
        return reflectionGroups
      }
    },
    settings: {
      type: new GraphQLNonNull(RetrospectiveMeetingSettings),
      description: 'The settings that govern the retrospective meeting',
      resolve: async ({id: meetingId}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {teamId} = meeting
        const allSettings = await dataLoader.get('meetingSettingsByTeamId').load(teamId)
        return allSettings.find((settings) => settings.meetingType === RETROSPECTIVE)
      }
    },
    taskCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of tasks generated in the meeting',
      resolve: async ({id: meetingId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {teamId} = meeting
        const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        return filterTasksByMeeting(teamTasks, meetingId, viewerId).length
      }
    },
    tasks: {
      type: new GraphQLNonNull(GraphQLList(GraphQLNonNull(Task))),
      description: 'The tasks created within the meeting',
      resolve: async ({id: meetingId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {teamId} = meeting
        const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        return filterTasksByMeeting(teamTasks, meetingId, viewerId)
      }
    },
    votesRemaining: {
      type: new GraphQLNonNull(GraphQLInt),
      description:
        'The sum total of the votes remaining for the meeting members that are present in the meeting',
      resolve: async ({id: meetingId}, _args, {dataLoader}) => {
        const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
        return meetingMembers.reduce(
          (sum, member) => (member.isCheckedIn ? sum + member.votesRemaining : sum),
          0
        )
      }
    },
    viewerMeetingMember: {
      type: new GraphQLNonNull(RetrospectiveMeetingMember),
      description: 'The retrospective meeting member of the viewer',
      resolve: ({id: meetingId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const meetingMemberId = toTeamMemberId(meetingId, viewerId)
        return dataLoader.get('meetingMembers').load(meetingMemberId)
      }
    }
    // reflections: {
    //   type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RetroReflection))),
    //   description: 'The reflections generated during the reflect phase of the retro',
    //   resolve: async ({id}, args, {dataLoader}) => {
    //     const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(id);
    //     reflections.sort((a, b) => a.sortOrder < b.sortOrder ? -1 : 1);
    //     return reflections;
    //   }
    // }
  })
})

export default RetrospectiveMeeting
