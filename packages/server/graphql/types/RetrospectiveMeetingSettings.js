import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import CustomPhaseItem from 'server/graphql/types/CustomPhaseItem'
import TeamMeetingSettings, {
  teamMeetingSettingsFields
} from 'server/graphql/types/TeamMeetingSettings'
import {RETRO_PHASE_ITEM} from 'universal/utils/constants'
import ReflectTemplate from 'server/graphql/types/ReflectTemplate'

const RetrospectiveMeetingSettings = new GraphQLObjectType({
  name: 'RetrospectiveMeetingSettings',
  description: 'The retro-specific meeting settings',
  interfaces: () => [TeamMeetingSettings],
  fields: () => ({
    ...teamMeetingSettingsFields(),
    phaseItems: {
      type: new GraphQLList(new GraphQLNonNull(CustomPhaseItem)),
      description: 'the team-specific questions to ask during a retro',
      resolve: async ({teamId}, args, {dataLoader}) => {
        // this isn't too useful for retros since it isn't filtered by templateId
        const customPhaseItems = await dataLoader.get('customPhaseItemsByTeamId').load(teamId)
        return customPhaseItems.filter(({phaseItemType}) => phaseItemType === RETRO_PHASE_ITEM)
      }
    },
    totalVotes: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The total number of votes each team member receives for the voting phase'
    },
    maxVotesPerGroup: {
      type: new GraphQLNonNull(GraphQLInt),
      description:
        'The maximum number of votes a team member can vote for a single reflection group'
    },
    selectedTemplateId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'FK. The template that will be used to start the retrospective'
    },
    reflectTemplates: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReflectTemplate))),
      description: 'The list of templates used to start a retrospective',
      resolve: ({teamId}, _args, {dataLoader}) => {
        return dataLoader.get('reflectTemplatesByTeamId').load(teamId)
      }
    }
  })
})

export default RetrospectiveMeetingSettings
