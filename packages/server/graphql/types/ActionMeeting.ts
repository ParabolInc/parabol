import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import getRethink from '../../database/rethinkDriver'
import MeetingAction from '../../database/types/MeetingAction'
import {getUserId} from '../../utils/authorization'
import filterTasksByMeeting from '../../utils/filterTasksByMeeting'
import {GQLContext} from '../graphql'
import ActionMeetingMember from './ActionMeetingMember'
import ActionMeetingSettings from './ActionMeetingSettings'
import AgendaItem from './AgendaItem'
import NewMeeting, {newMeetingFields} from './NewMeeting'
import Task from './Task'

const ActionMeeting = new GraphQLObjectType<any, GQLContext>({
  name: 'ActionMeeting',
  interfaces: () => [NewMeeting],
  description: 'An action meeting',
  fields: () => ({
    ...newMeetingFields(),
    agendaItem: {
      type: AgendaItem,
      description: 'A single agenda item',
      args: {
        agendaItemId: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: async ({id: meetingId}, {agendaItemId}, {dataLoader}) => {
        const agendaItem = await dataLoader.get('agendaItems').load(agendaItemId)
        if (agendaItem.meetingId !== meetingId) return null
        return agendaItem
      }
    },
    agendaItemCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of agenda items generated in the meeting',
      resolve: async ({agendaItemCount}) => {
        // only populated after the meeting has been completed (not killed)
        return agendaItemCount || 0
      }
    },
    agendaItems: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AgendaItem))),
      description: 'All of the agenda items for the meeting',
      resolve: async ({id: meetingId}, _args: unknown, {dataLoader}) => {
        return await dataLoader.get('agendaItemsByMeetingId').load(meetingId)
      }
    },
    commentCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of comments generated in the meeting',
      resolve: async ({commentCount}) => {
        // only populated after the meeting has been completed (not killed)
        return commentCount || 0
      }
    },
    meetingMembers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ActionMeetingMember))),
      description: 'The team members that were active during the time of the meeting',
      resolve: ({id: meetingId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('meetingMembersByMeetingId').load(meetingId)
      }
    },
    settings: {
      type: new GraphQLNonNull(ActionMeetingSettings),
      description: 'The settings that govern the action meeting',
      resolve: async ({teamId}, _args: unknown, {dataLoader}) => {
        return await dataLoader.get('meetingSettingsByType').load({teamId, meetingType: 'action'})
      }
    },
    taskCount: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The number of tasks generated in the meeting',
      resolve: async ({taskCount}) => {
        // only populated after the meeting has been completed (not killed)
        return taskCount || 0
      }
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
    viewerMeetingMember: {
      type: ActionMeetingMember,
      description: 'The action meeting member of the viewer',
      resolve: async ({id: meetingId}, _args: unknown, {authToken, dataLoader}: GQLContext) => {
        const viewerId = getUserId(authToken)
        const meetingMemberId = toTeamMemberId(meetingId, viewerId)
        const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
        return meetingMember || null
      }
    },
    lastMeeting: {
      type: NewMeeting,
      description: 'The last action meeting before this one',
      resolve: async ({id: meetingId, teamId}, _args: unknown) => {
        const r = await getRethink()
        return (
          ((await r
            .table('NewMeeting')
            .getAll(teamId, {index: 'teamId'})
            .filter({meetingType: 'action'})
            .filter((row: any) => row('id').ne(meetingId))
            .orderBy(r.desc('createdAt'))
            .nth(0)
            .default(null)
            .run()) as MeetingAction) || null
        )
      }
    }
  })
})

export default ActionMeeting
