import {GraphQLScalarType} from 'graphql'

const GraphQLFileStreamType = new GraphQLScalarType({
  name: 'FileStream',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => ast
})

export default GraphQLFileStreamType
