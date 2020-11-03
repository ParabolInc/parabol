import {GraphQLScalarType} from 'graphql'

export interface ResolvedFile {
  fileBuffer: any // todo: use real type
  contentType: string
}

const GraphQLFileType = new GraphQLScalarType({
  name: 'File',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => ast
})

export default GraphQLFileType
