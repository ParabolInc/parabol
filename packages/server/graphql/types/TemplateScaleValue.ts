import {
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {GQLContext} from '../graphql'

const TemplateScaleValue = new GraphQLObjectType<any, GQLContext>({
  name: 'TemplateScaleValue',
  description:
    'A value for a scale.',
  fields: () => ({
    color: {
      description: 'The color used to visually group a scale value',
      type: new GraphQLNonNull(GraphQLString),
    },
    value: {
      description: 'The numerical value for this scale value',
      type: new GraphQLNonNull(GraphQLInt),
    },
    label: {
      description: 'The label for this value, e.g., XS, M, L',
      type: new GraphQLNonNull(GraphQLString)
    }
  })
})

export default TemplateScaleValue