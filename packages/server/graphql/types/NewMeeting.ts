import {GraphQLID, GraphQLInt, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import {GQLContext} from 'server/graphql/graphql'
import ActionMeeting from 'server/graphql/types/ActionMeeting'
import GraphQLISO8601Type from 'server/graphql/types/GraphQLISO8601Type'
import {resolveTeam} from 'server/graphql/resolvers'
import RetrospectiveMeeting from 'server/graphql/types/RetrospectiveMeeting'
import Team from 'server/graphql/types/Team'
import NewMeetingPhase from 'server/graphql/types/NewMeetingPhase'
import MeetingTypeEnum from 'server/graphql/types/MeetingTypeEnum'
import {ACTION, RETROSPECTIVE} from 'universal/utils/constants'
import MeetingMember from 'server/graphql/types/MeetingMember'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import {getUserId} from 'server/utils/authorization'
import TeamMember from 'server/graphql/types/TeamMember'

export const newMeetingFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The unique meeting id. shortid.'
  },
  createdAt: {
    type: GraphQLISO8601Type,
    description: 'The timestamp the meeting was created'
  },
  defaultFacilitatorUserId: {
    type: new GraphQLNonNull(GraphQLID),
    description:
      'The userId of the desired facilitator (different form facilitatorUserId if disconnected)'
  },
  endedAt: {
    type: GraphQLISO8601Type,
    description: 'The timestamp the meeting officially ended'
  },
  facilitatorStageId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The location of the facilitator in the meeting'
  },
  facilitatorUserId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'The userId (or anonymousId) of the most recent facilitator'
  },
  facilitator: {
    type: new GraphQLNonNull(TeamMember),
    description: 'The facilitator team member',
    resolve: ({facilitatorUserId, teamId}, _args, {dataLoader}) => {
      const teamMemberId = toTeamMemberId(teamId, facilitatorUserId)
      return dataLoader.get('teamMembers').load(teamMemberId)
    }
  },
  meetingMembers: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(MeetingMember))),
    description: 'The team members that were active during the time of the meeting',
    resolve: ({id: meetingId}, _args, {dataLoader}: GQLContext) => {
      return dataLoader.get('meetingMembersByMeetingId').load(meetingId)
    }
  },
  meetingNumber: {
    type: new GraphQLNonNull(GraphQLInt),
    description: 'The auto-incrementing meeting number for the team'
  },
  meetingType: {
    type: new GraphQLNonNull(MeetingTypeEnum)
  },
  phases: {
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NewMeetingPhase))),
    description: 'The phases the meeting will go through, including all phase-specific state',
    resolve: ({phases, id: meetingId}) => {
      return phases.map((phase) => ({
        ...phase,
        meetingId
      }))
    }
  },
  summarySentAt: {
    type: GraphQLISO8601Type,
    description: 'The time the meeting summary was emailed to the team'
  },
  teamId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'foreign key for team'
  },
  team: {
    type: new GraphQLNonNull(Team),
    description: 'The team that ran the meeting',
    resolve: resolveTeam
  },
  updatedAt: {
    type: GraphQLISO8601Type,
    description: 'The last time a meeting was updated (stage completed, finished, etc)'
  },
  viewerMeetingMember: {
    type: new GraphQLNonNull(MeetingMember),
    description: 'The meeting member of the viewer',
    resolve: ({id: meetingId}, _args, {authToken, dataLoader}: GQLContext) => {
      const viewerId = getUserId(authToken)
      const meetingMemberId = toTeamMemberId(meetingId, viewerId)
      return dataLoader.get('meetingMembers').load(meetingMemberId)
    }
  }
})

const NewMeeting = new GraphQLInterfaceType({
  name: 'NewMeeting',
  description: 'A team meeting history for all previous meetings',
  fields: newMeetingFields,
  resolveType: ({meetingType}) => {
    const resolveTypeLookup = {
      [RETROSPECTIVE]: RetrospectiveMeeting,
      [ACTION]: ActionMeeting
    }
    return resolveTypeLookup[meetingType]
  }
})

export default NewMeeting
