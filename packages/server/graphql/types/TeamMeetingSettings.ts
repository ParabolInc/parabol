import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import {resolveTeam} from '../resolvers'
import ActionMeetingSettings from './ActionMeetingSettings'
import MeetingTypeEnum from './MeetingTypeEnum'
import {MeetingTypeEnum as TMeetingTypeEnum} from '../../postgres/types/Meeting'
import NewMeetingPhaseTypeEnum from './NewMeetingPhaseTypeEnum'
import PokerMeetingSettings from './PokerMeetingSettings'
import RetrospectiveMeetingSettings from './RetrospectiveMeetingSettings'
import TeamPromptMeetingSettings from './TeamPromptMeetingSettings'
import Team from './Team'

export const teamMeetingSettingsFields = () => ({
  id: {
    type: new GraphQLNonNull(GraphQLID)
  },
  meetingType: {
    description: 'The type of meeting these settings apply to',
    type: new GraphQLNonNull(MeetingTypeEnum)
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
    type: new GraphQLNonNull(Team),
    resolve: resolveTeam
  }
})

const TeamMeetingSettings: GraphQLInterfaceType = new GraphQLInterfaceType({
  name: 'TeamMeetingSettings',
  description: 'The team settings for a specific type of meeting',
  fields: teamMeetingSettingsFields,
  resolveType: ({meetingType}: {meetingType: TMeetingTypeEnum}) => {
    const resolveTypeLookup = {
      action: ActionMeetingSettings,
      retrospective: RetrospectiveMeetingSettings,
      poker: PokerMeetingSettings,
      teamPrompt: TeamPromptMeetingSettings
    }
    return resolveTypeLookup[meetingType]
  }
})

export default TeamMeetingSettings
