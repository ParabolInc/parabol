import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import {getTeamPromptResponsesByMeetingId} from '../../postgres/queries/getTeamPromptResponsesByMeetingIds'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import NewMeeting, {newMeetingFields} from './NewMeeting'
import TeamPromptMeetingMember from './TeamPromptMeetingMember'
import TeamPromptMeetingSettings from './TeamPromptMeetingSettings'
import TeamPromptResponse from './TeamPromptResponse'

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
      description: 'The responses created in the meeting',
      resolve: ({id: meetingId}: {id: string}, _args: unknown, {}) => {
        return getTeamPromptResponsesByMeetingId(meetingId)
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
