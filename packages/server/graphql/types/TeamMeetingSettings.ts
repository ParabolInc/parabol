import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import NewMeetingPhaseTypeEnum from './NewMeetingPhaseTypeEnum'
import Team from './Team'
import {resolveTeam} from '../resolvers'
import MeetingTypeEnum from './MeetingTypeEnum'
import {ACTION, RETROSPECTIVE} from 'parabol-client/utils/constants'
import RetrospectiveMeetingSettings from './RetrospectiveMeetingSettings'
import ActionMeetingSettings from './ActionMeetingSettings'

export const teamMeetingSettingsFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID)
  },
  meetingType: {
    description: 'The type of meeting these settings apply to',
    type: MeetingTypeEnum
  },
  phaseTypes: {
    description: 'The broad phase types that will be addressed during the meeting',
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NewMeetingPhaseTypeEnum)))
  },
  teamId: {
    description: 'FK',
    type: new GraphQLNonNull(GraphQLID)
  },
  team: {
    description: 'The team these settings belong to',
    type: Team,
    resolve: resolveTeam
  }
})

const TeamMeetingSettings = new GraphQLInterfaceType({
  name: 'TeamMeetingSettings',
  description: 'The team settings for a specific type of meeting',
  fields: teamMeetingSettingsFields,
  resolveType: ({meetingType}) => {
    const resolveTypeLookup = {
      [ACTION]: ActionMeetingSettings,
      [RETROSPECTIVE]: RetrospectiveMeetingSettings
    }
    return resolveTypeLookup[meetingType]
  }
})

export default TeamMeetingSettings
