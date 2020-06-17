import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {RETRO_PHASE_ITEM} from 'parabol-client/utils/constants'
import {GQLContext} from '../graphql'
import CustomPhaseItem from './CustomPhaseItem'
import ReflectTemplate from './ReflectTemplate'
import TeamMeetingSettings, {teamMeetingSettingsFields} from './TeamMeetingSettings'

const RetrospectiveMeetingSettings = new GraphQLObjectType<any, GQLContext>({
  name: 'RetrospectiveMeetingSettings',
  description: 'The retro-specific meeting settings',
  interfaces: () => [TeamMeetingSettings],
  fields: () => ({
    ...teamMeetingSettingsFields(),
    phaseItems: {
      type: new GraphQLList(new GraphQLNonNull(CustomPhaseItem)),
      description: 'the team-specific questions to ask during a retro',
      resolve: async ({teamId}, _args, {dataLoader}) => {
        // this isn't too useful for retros since it isn't filtered by templateId
        const customPhaseItems = await dataLoader.get('customPhaseItemsByTeamId').load(teamId)
        return customPhaseItems.filter(({phaseItemType}) => phaseItemType === RETRO_PHASE_ITEM)
      }
    },
    totalVotes: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The total number of votes each team member receives for the voting phase'
    },
    managedTemplateIds: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(GraphQLID))),
      description: 'The list of template ids that the team uses that are managed by other teams'
    },
    managedTemplates: {
      type: GraphQLNonNull(GraphQLList(GraphQLNonNull(ReflectTemplate))),
      description: 'The list of templates that the team uses that are managed by other teams',
      resolve: ({managedTemplateIds}, _args, {dataLoader}) => {
        return dataLoader.get('reflectTemplates').loadMany(managedTemplateIds)
      }
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
