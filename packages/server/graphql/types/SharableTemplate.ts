import {GraphQLID, GraphQLNonNull, GraphQLString, GraphQLInterfaceType, GraphQLBoolean} from 'graphql'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import SharingScopeEnum from './SharingScopeEnum'
import Team from './Team'
import {SharableTemplateEnum} from 'parabol-client/types/graphql'
import ReflectTemplate from './ReflectTemplate'
import PokerTemplate from './PokerTemplate'

export const sharableTemplateFields = () => ({
  id: {
    type: GraphQLNonNull(GraphQLID),
    description: 'shortid'
  },
  createdAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type)
  },
  isActive: {
    type: new GraphQLNonNull(GraphQLBoolean),
    description: 'True if template can be used, else false'
  },
  lastUsedAt: {
    type: GraphQLISO8601Type,
    description: 'The time of the meeting the template was last used'
  },
  name: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'The name of the template'
  },
  orgId: {
    type: GraphQLNonNull(GraphQLID),
    description: '*Foreign key. The organization that owns the team that created the template'
  },
  scope: {
    type: GraphQLNonNull(SharingScopeEnum),
    description: 'Who can see this template'
  },
  teamId: {
    type: new GraphQLNonNull(GraphQLID),
    description: '*Foreign key. The team this template belongs to'
  },
  team: {
    type: new GraphQLNonNull(Team),
    description: 'The team this template belongs to',
    resolve: async ({teamId}, _args, {dataLoader}) => {
      const team = await dataLoader.get('teams').load(teamId)
      return team
    }
  },
  updatedAt: {
    type: new GraphQLNonNull(GraphQLISO8601Type)
  }
})

const SharableTemplate = new GraphQLInterfaceType({
  name: 'SharableTemplate',
  description: 'A meeting template that can be shared across team, orgnization and public',
  fields: sharableTemplateFields,
  resolveType: (type) => {
    const templateType = type.prompts ? SharableTemplateEnum.RETROSPECTIVE : SharableTemplateEnum.SPRINT_POKER
    const lookup = {
      [SharableTemplateEnum.RETROSPECTIVE]: ReflectTemplate,
      [SharableTemplateEnum.SPRINT_POKER]: PokerTemplate
    }
    return lookup[templateType]
  }
})

export default SharableTemplate