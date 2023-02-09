import {GraphQLID, GraphQLObjectType} from 'graphql'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import {resolveTeam, resolveTeamMember} from '../resolvers'
import {GQLContext} from './../graphql'
import NewMeeting from './NewMeeting'
import NotificationTeamInvitation from './NotificationTeamInvitation'
import StandardMutationError from './StandardMutationError'
import Team from './Team'
import TeamMember from './TeamMember'
import User from './User'

const AcceptTeamInvitationPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'AcceptTeamInvitationPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    authToken: {
      type: GraphQLID,
      description: 'The new auth token sent to the mutator'
    },
    meetingId: {
      type: GraphQLID,
      description: 'the meetingId to redirect to'
    },
    team: {
      type: Team,
      description: 'The team that the invitee will be joining',
      resolve: resolveTeam
    },
    teamMember: {
      type: TeamMember,
      description: 'The new team member on the team',
      resolve: resolveTeamMember
    },
    meeting: {
      type: NewMeeting,
      description: 'the requested meeting',
      resolve: async (
        {meetingId}: {meetingId: string},
        _args: unknown,
        {dataLoader, authToken}: GQLContext
      ) => {
        const viewerId = getUserId(authToken)
        const meeting = await dataLoader.get('newMeetings').load(meetingId)
        if (!meeting) {
          standardError(new Error('Meeting not found'), {userId: viewerId, tags: {meetingId}})
          return null
        }
        const {teamId} = meeting
        if (!isTeamMember(authToken, teamId)) {
          const meetingMemberId = toTeamMemberId(meetingId, viewerId)
          const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
          if (!meetingMember) {
            // standardError(new Error('Team not found'), {userId: viewerId, tags: {teamId}})
            return null
          }
        }
        return meeting
      }
    },
    notifications: {
      type: NotificationTeamInvitation,
      resolve: (
        {notificationId}: {notificationId: string},
        _args: unknown,
        {dataLoader}: GQLContext
      ) => {
        return dataLoader.get('notifications').load(notificationId)
      }
    },
    teamLead: {
      type: User,
      description: 'For payloads going to the team leader that got new suggested actions',
      resolve: async (
        {teamLeadId}: {teamLeadId: string},
        _args: unknown,
        {dataLoader}: GQLContext
      ) => {
        return teamLeadId ? dataLoader.get('users').load(teamLeadId) : null
      }
    }
  })
})

export default AcceptTeamInvitationPayload
