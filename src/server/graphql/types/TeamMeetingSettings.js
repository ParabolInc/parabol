import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import NewMeetingPhaseTypeEnum from 'server/graphql/types/NewMeetingPhaseTypeEnum'
import Team from 'server/graphql/types/Team'
import {resolveTeam} from 'server/graphql/resolvers'
import MeetingTypeEnum from 'server/graphql/types/MeetingTypeEnum'
import {ACTION, RETROSPECTIVE} from 'universal/utils/constants'
import RetrospectiveMeetingSettings from 'server/graphql/types/RetrospectiveMeetingSettings'
import ActionMeetingSettings from 'server/graphql/types/ActionMeetingSettings'

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
