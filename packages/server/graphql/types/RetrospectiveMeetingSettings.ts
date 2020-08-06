import {GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {GQLContext} from '../graphql'
import ReflectTemplate from './ReflectTemplate'
import TeamMeetingSettings, {teamMeetingSettingsFields} from './TeamMeetingSettings'

const RetrospectiveMeetingSettings = new GraphQLObjectType<any, GQLContext>({
  name: 'RetrospectiveMeetingSettings',
  description: 'The retro-specific meeting settings',
  interfaces: () => [TeamMeetingSettings],
  fields: () => ({
    ...teamMeetingSettingsFields(),
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
