import {GraphQLError} from 'graphql'
import {Kind} from 'graphql/language'
import {urlRegex} from 'parabol-client/validation/regex'
import type {UrlScalarConfig} from '../resolverTypes'

const URL: UrlScalarConfig = {
  name: 'URL',
  serialize: (value) => String(value),
  parseValue: (value) => String(value),
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`URL must be a string, not a ${ast.kind}`, {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
    const {value} = ast
    if (value.length < 1) {
      throw new GraphQLError('URL must have a minimum length of 1', {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
    if (value.length > 2083) {
      throw new GraphQLError('URL is too long', {extensions: {code: 'BAD_USER_INPUT'}})
    }
    if (!urlRegex.test(value)) {
      throw new GraphQLError('Not a valid URL', {extensions: {code: 'BAD_USER_INPUT'}})
    }
    return value
  }
}

export default URL
