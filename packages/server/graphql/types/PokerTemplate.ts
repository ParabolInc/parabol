import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import TemplateDimension from './TemplateDimension'
import SharableTemplate, {sharableTemplateFields} from './SharableTemplate'

const PokerTemplate = new GraphQLObjectType<any, GQLContext>({
  name: 'PokerTemplate',
  description: 'The team-specific templates for sprint poker meeting',
  interfaces: () => [SharableTemplate],
  fields: () => ({
    ...sharableTemplateFields(),
    dimensions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TemplateDimension))),
      description: 'The dimensions that are part of this template',
      resolve: async ({id: templateId}, _args, {dataLoader}) => {
        const dimensions = await dataLoader.get('dimensionsByTemplateId').load(templateId)
        dimensions.sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
        return dimensions
      }
    }
  })
})

const {connectionType, edgeType} = connectionDefinitions({
  name: PokerTemplate.name,
  nodeType: PokerTemplate
})

export const PokerTemplateConnection = connectionType
export const PokerTemplateEdge = edgeType
export default PokerTemplate
