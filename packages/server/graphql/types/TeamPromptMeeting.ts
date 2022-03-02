import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import TeamPromptMeetingMember from './TeamPromptMeetingMember'
import ActionMeetingSettings from './ActionMeetingSettings'
import NewMeeting, {newMeetingFields} from './NewMeeting'
import Task from './Task'

const TeamPromptMeeting = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamPromptMeeting',
  interfaces: () => [NewMeeting],
  description: 'A team prompt meeting',
  fields: () => ({
    ...newMeetingFields(),
    settings: {
      type: new GraphQLNonNull(ActionMeetingSettings),
      description: 'The settings that govern the action meeting',
      resolve: ({teamId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('meetingSettingsByType').load({teamId, meetingType: 'teamPrompt'})
      }
    },
    responses: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Task))),
      description: 'The tasks created within the meeting',
      resolve: () => {
        // TODO: implement fetching responses
        return []
      }
    },
    viewerMeetingMember: {
      type: TeamPromptMeetingMember,
      description: 'The team prompt meeting member of the viewer',
      resolve: async ({id: meetingId}, _args: unknown, {authToken, dataLoader}: GQLContext) => {
        const viewerId = getUserId(authToken)
        const meetingMemberId = toTeamMemberId(meetingId, viewerId)
        const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
        return meetingMember || null
      }
    }
  })
})

export default TeamPromptMeeting
