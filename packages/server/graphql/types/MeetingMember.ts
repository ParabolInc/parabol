import {GraphQLBoolean, GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import ActionMeetingMember from './ActionMeetingMember'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import MeetingTypeEnum from './MeetingTypeEnum'
import {ACTION, RETROSPECTIVE} from 'parabol-client/utils/constants'
import RetrospectiveMeetingMember from './RetrospectiveMeetingMember'
import {resolveUser} from '../resolvers'
import User from './User'
import TeamMember from './TeamMember'
import {GQLContext} from '../graphql'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'

export const meetingMemberFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'A composite of userId::meetingId'
  },
  isCheckedIn: {
    type: GraphQLBoolean,
    description: 'true if present, false if absent, else null'
  },
  meetingId: {
    type: new GraphQLNonNull(GraphQLID)
  },
  meetingType: {
    type: new GraphQLNonNull(MeetingTypeEnum)
  },
  teamId: {
    type: new GraphQLNonNull(GraphQLID)
  },
  teamMember: {
    type: new GraphQLNonNull(TeamMember),
    resolve: ({teamId, userId}, _args, {dataLoader}: GQLContext) => {
      const teamMemberId = toTeamMemberId(teamId, userId)
      return dataLoader.get('teamMembers').load(teamMemberId)
    }
  },
  user: {
    type: new GraphQLNonNull(User),
    resolve: resolveUser
  },
  userId: {
    type: new GraphQLNonNull(GraphQLID)
  },
  updatedAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type),
    description: 'The last time a meeting was updated (stage completed, finished, etc)'
  }
})

const MeetingMember = new GraphQLInterfaceType({
  name: 'MeetingMember',
  description: 'All the user details for a specific meeting',
  fields: meetingMemberFields,
  resolveType: ({meetingType}) => {
    const resolveTypeLookup = {
      [RETROSPECTIVE]: RetrospectiveMeetingMember,
      [ACTION]: ActionMeetingMember
    }
    return resolveTypeLookup[meetingType]
  }
})

export default MeetingMember
