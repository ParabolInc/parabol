import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import TeamPromptMeetingMember from './TeamPromptMeetingMember'
import NewMeeting, {newMeetingFields} from './NewMeeting'
import TeamPromptResponse from './TeamPromptResponse'
import TeamPromptMeetingSettings from './TeamPromptMeetingSettings'

const TeamPromptMeeting = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamPromptMeeting',
  interfaces: () => [NewMeeting],
  description: 'A team prompt meeting',
  fields: () => ({
    ...newMeetingFields(),
    settings: {
      type: new GraphQLNonNull(TeamPromptMeetingSettings),
      description: 'The settings that govern the team prompt meeting',
      resolve: ({teamId}: {teamId: string}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('meetingSettingsByType').load({teamId, meetingType: 'teamPrompt'})
      }
    },
    responses: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TeamPromptResponse))),
      description: 'The tasks created within the meeting',
      resolve: () => {
        // TODO: implement fetching responses
        return []
      }
    },
    viewerMeetingMember: {
      type: TeamPromptMeetingMember,
      description: 'The team prompt meeting member of the viewer',
      resolve: async (
        {id: meetingId}: {id: string},
        _args: unknown,
        {authToken, dataLoader}: GQLContext
      ) => {
        const viewerId = getUserId(authToken)
        const meetingMemberId = toTeamMemberId(meetingId, viewerId)
        return dataLoader.get('meetingMembers').load(meetingMemberId)
      }
    }
  })
})

export default TeamPromptMeeting
