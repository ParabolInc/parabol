import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import connectionDefinitions from '../connectionDefinitions'
import {GQLContext} from '../graphql'
import TemplateDimension from './TemplateDimension'
import SharableTemplate, {sharableTemplateFields} from './SharableTemplate'
import TemplateScale from './TemplateScale'

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
    },
    scales: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(TemplateScale))),
      description: 'The scales that are part of this template',
      resolve: async ({id: templateId}, _args, {dataLoader}) => {
        const scales = await dataLoader.get('scalesByTemplateId').load(templateId)
        scales.sort((a, b) => (a.sortOrder < b.sortOrder ? -1 : 1))
        return scales
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
