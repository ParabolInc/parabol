import {GraphQLBoolean, GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import ActionMeetingMember from './ActionMeetingMember'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import MeetingTypeEnum from './MeetingTypeEnum'
import {ACTION, RETROSPECTIVE} from '../../../universal/utils/constants'
import RetrospectiveMeetingMember from './RetrospectiveMeetingMember'
import {resolveUser} from '../resolvers'
import User from './User'

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
