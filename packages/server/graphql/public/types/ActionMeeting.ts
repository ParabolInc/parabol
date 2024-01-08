import toTeamMemberId from '../../../../client/utils/relay/toTeamMemberId'
import {getUserId} from '../../../utils/authorization'
import filterTasksByMeeting from '../../../utils/filterTasksByMeeting'
import {ActionMeetingResolvers} from '../resolverTypes'

const ActionMeeting: ActionMeetingResolvers = {
  agendaItem: async ({id: meetingId}, {agendaItemId}, {dataLoader}) => {
    const agendaItem = await dataLoader.get('agendaItems').load(agendaItemId)
    if (agendaItem.meetingId !== meetingId) return null
    return agendaItem
  },
  agendaItemCount: async ({agendaItemCount}) => {
    // only populated after the meeting has been completed (not killed)
    return agendaItemCount || 0
  },
  agendaItems: async ({id: meetingId}, _args: unknown, {dataLoader}) => {
    return await dataLoader.get('agendaItemsByMeetingId').load(meetingId)
  },
  commentCount: async ({commentCount}) => {
    // only populated after the meeting has been completed (not killed)
    return commentCount || 0
  },
  meetingMembers: ({id: meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  },
  taskCount: async ({taskCount}) => {
    // only populated after the meeting has been completed (not killed)
    return taskCount || 0
  },
  tasks: async ({id: meetingId}, _args: unknown, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    const {teamId} = meeting
    const teamTasks = await dataLoader.get('tasksByTeamId').load(teamId)
    return filterTasksByMeeting(teamTasks, meetingId, viewerId)
  },
  viewerMeetingMember: async ({id: meetingId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const meetingMemberId = toTeamMemberId(meetingId, viewerId)
    const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
    return meetingMember || null
  }
}

export default ActionMeeting
