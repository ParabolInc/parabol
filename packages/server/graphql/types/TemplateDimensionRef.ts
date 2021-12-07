import {GraphQLFloat, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import TemplateDimensionRefId from '../../../client/shared/gqlIds/TemplateDimensionRefId'
import {GQLContext} from '../graphql'
import TemplateScaleRef from './TemplateScaleRef'

const TemplateDimensionRef = new GraphQLObjectType<any, GQLContext>({
  name: 'TemplateDimensionRef',
  description: 'An immutable TemplateDimension',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: ({meetingId, dimensionRefIdx}) =>
        TemplateDimensionRefId.join(meetingId, dimensionRefIdx)
    },
    sortOrder: {
      type: new GraphQLNonNull(GraphQLFloat),
      description: 'the order of the dimensions in the template',
      resolve: ({dimensionRefIdx}) => dimensionRefIdx
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the dimension'
    },
    scaleRefId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The md5 hash to resolve the immutable selected scale ref'
    },
    scale: {
      type: new GraphQLNonNull(TemplateScaleRef),
      description: 'scale used in this dimension',
      resolve: async ({scaleRefId}, _args: unknown, {dataLoader}) => {
        const scaleFromPg = await dataLoader.get('templateScaleRefs').load(scaleRefId)
        return scaleFromPg
      }
    }
  })
})

export default TemplateDimensionRef
