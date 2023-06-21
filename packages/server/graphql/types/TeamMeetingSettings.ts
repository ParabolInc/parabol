import {GraphQLID, GraphQLInterfaceType, GraphQLList, GraphQLNonNull} from 'graphql'
import {MeetingTypeEnum as TMeetingTypeEnum} from '../../postgres/types/Meeting'
import {NewMeetingPhaseTypeEnum as TNewMeetingPhaseTypeEnum} from '../../database/types/GenericMeetingPhase'
import {resolveTeam} from '../resolvers'
import ActionMeetingSettings from './ActionMeetingSettings'
import MeetingTypeEnum from './MeetingTypeEnum'
import NewMeetingPhaseTypeEnum from './NewMeetingPhaseTypeEnum'
import PokerMeetingSettings from './PokerMeetingSettings'
import RetrospectiveMeetingSettings from './RetrospectiveMeetingSettings'
import Team from './Team'
import TeamPromptMeetingSettings from './TeamPromptMeetingSettings'
import isPhaseAvailable from '../../utils/isPhaseAvailable'
import {GQLContext} from '../graphql'

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
    type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(NewMeetingPhaseTypeEnum))),
    resolve: async (
      {phaseTypes, teamId}: {phaseTypes: TNewMeetingPhaseTypeEnum[]; teamId: string},
      _args: unknown,
      {dataLoader}: GQLContext
    ) => {
      const team = await dataLoader.get('teams').loadNonNull(teamId)
      return phaseTypes.filter(isPhaseAvailable(team.tier))
    }
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
    } as const
    return resolveTypeLookup[meetingType as keyof typeof resolveTypeLookup]
  }
})

export default TeamMeetingSettings
