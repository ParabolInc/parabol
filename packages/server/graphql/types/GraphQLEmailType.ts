import {GraphQLScalarType} from 'graphql'
import {Kind} from 'graphql/language'
import {emailRegex} from 'parabol-client/validation/regex'

const GraphQLEmailType = new GraphQLScalarType({
  name: 'Email',
  serialize: (value) => (value as string).toLowerCase(),
  parseValue: (value) => (value as string).toLowerCase(),
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) {
      throw new Error(`Query error: Email is not a string, it is a: ${ast.kind}`)
    }
    if (!emailRegex.test(ast.value)) {
      throw new Error('Query error: Not a valid Email')
    }
    if (ast.value.length < 4) {
      throw new Error('Query error: Email must have a minimum length of 4.')
    }
    if (ast.value.length > 300) {
      throw new Error('Query error: Email is too long.')
    }
    return ast.value.toLowerCase()
  }
})

export default GraphQLEmailType
