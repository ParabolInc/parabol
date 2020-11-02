import {GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLString} from 'graphql'

const TemplateScaleInput = new GraphQLInputObjectType({
  name: 'TemplateScaleInput',
  description: 'A value for a scale',
  fields: () => ({
    color: {
      description: 'The color used to visually group a scale value',
      type: new GraphQLNonNull(GraphQLString)
    },
    value: {
      description: 'The numerical value for this scale value',
      type: new GraphQLNonNull(GraphQLInt)
    },
    label: {
      description: 'The label for this value, e.g., XS, M, L',
      type: new GraphQLNonNull(GraphQLString)
    }
  })
})

export default TemplateScaleInput
