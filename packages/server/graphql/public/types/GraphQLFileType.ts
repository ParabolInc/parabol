import {GraphQLScalarType} from 'graphql'

export type File = {
  contentType: string
  buffer: {
    type: 'Buffer'
    data: Array<number>
  }
}

const GraphQLFileType = new GraphQLScalarType({
  name: 'File',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => ast
})

export default GraphQLFileType
