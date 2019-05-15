import {GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from 'server/graphql/graphql'
import ActionMeetingMember from 'server/graphql/types/ActionMeetingMember'
import ActionMeetingSettings from 'server/graphql/types/ActionMeetingSettings'
import NewMeeting, {newMeetingFields} from 'server/graphql/types/NewMeeting'
import Task from 'server/graphql/types/Task'
import {getUserId} from 'server/utils/authorization'
import {IActionMeeting} from 'universal/types/graphql'
import {RETROSPECTIVE} from 'universal/utils/constants'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'

const ActionMeeting = new GraphQLObjectType<IActionMeeting, GQLContext>({
  name: 'ActionMeeting',
  interfaces: () => [NewMeeting],
  description: 'An action meeting',
  fields: () => ({
    ...newMeetingFields(),
    meetingMembers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ActionMeetingMember))),
      description: 'The team members that were active during the time of the meeting',
      resolve: ({id: meetingId}, _args, {dataLoader}) => {
        return dataLoader.get('meetingMembersByMeetingId').load(meetingId)
      }
    },
    settings: {
      type: new GraphQLNonNull(ActionMeetingSettings),
      description: 'The settings that govern the action meeting',
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
      resolve: async ({id: meetingId, taskCount}, _args, {dataLoader}) => {
        if (Number.isFinite(taskCount)) return taskCount
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {teamId} = meeting
        const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        return teamTasks.filter((task) => task.meetingId === meetingId).length
      }
    },
    tasks: {
      type: new GraphQLNonNull(GraphQLList(GraphQLNonNull(Task))),
      description: 'The tasks created within the meeting',
      resolve: async ({id: meetingId}, _args, {dataLoader}) => {
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        const {teamId} = meeting
        const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        return teamTasks.filter((task) => task.meetingId === meetingId)
      }
    },
    viewerMeetingMember: {
      type: new GraphQLNonNull(ActionMeetingMember),
      description: 'The action meeting member of the viewer',
      resolve: ({id: meetingId}, _args, {authToken, dataLoader}) => {
        const viewerId = getUserId(authToken)
        const meetingMemberId = toTeamMemberId(meetingId, viewerId)
        return dataLoader.get('meetingMembers').load(meetingMemberId)
      }
    }
  })
})

export default ActionMeeting
