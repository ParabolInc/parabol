import {GraphQLID, GraphQLInterfaceType, GraphQLNonNull} from 'graphql'
import {CHECKIN, UPDATES} from 'parabol-client/utils/constants'
import CheckInStage from './CheckInStage'
import {resolveTeamMember} from '../resolvers'
import TeamMember from './TeamMember'
import UpdatesStage from './UpdatesStage'
import MeetingMember from './MeetingMember'
import {GQLContext} from '../graphql'
import fromTeamMemberId from 'parabol-client/utils/relay/fromTeamMemberId'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'

export const newMeetingTeamMemberStageFields = () => ({
  meetingMember: {
    description: 'The meeting member that is the focus for this phase item',
    type: new GraphQLNonNull(MeetingMember),
    resolve: async (
      {meetingId, teamMemberId}: {meetingId: string; teamMemberId: string},
      _args: unknown,
      {dataLoader}: GQLContext
    ) => {
      const {userId} = fromTeamMemberId(teamMemberId)
      const meetingMemberId = toTeamMemberId(meetingId, userId)
      return dataLoader.get('meetingMembers').load(meetingMemberId)
    }
  },
  teamMemberId: {
    type: new GraphQLNonNull(GraphQLID),
    description: 'foreign key. use teamMember'
  },
  teamMember: {
    description: 'The team member that is the focus for this phase item',
    type: new GraphQLNonNull(TeamMember),
    resolve: resolveTeamMember
  }
})

const NewMeetingTeamMemberStage: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'NewMeetingTeamMemberStage',
  description:
    'An instance of a meeting phase item. On the client, this usually represents a single view',
  fields: newMeetingTeamMemberStageFields,
  resolveType: ({phaseType}) => {
    const resolveTypeLookup = {
      [CHECKIN]: CheckInStage,
      [UPDATES]: UpdatesStage
    } as const
    return resolveTypeLookup[phaseType as keyof typeof resolveTypeLookup]
  }
})

export default NewMeetingTeamMemberStage
