import {GraphQLError} from 'graphql'
import {Kind} from 'graphql/language'
import {urlRegex} from 'parabol-client/validation/regex'
import type {UrlScalarConfig} from '../resolverTypes'

// urlRegex has the g flag, so its test() resumes from the previous match and fails every other call
const urlPattern = new RegExp(urlRegex.source)

const parseURL = (value: string) => {
  if (value.length < 1) {
    throw new GraphQLError('URL must have a minimum length of 1', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (value.length > 2083) {
    throw new GraphQLError('URL is too long', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  if (!urlPattern.test(value)) {
    throw new GraphQLError('Not a valid URL', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  return value
}

const URL: UrlScalarConfig = {
  name: 'URL',
  serialize: (value) => String(value),
  parseValue: (value) => {
    if (typeof value !== 'string') {
      throw new GraphQLError(`URL must be a string, not ${typeof value}`, {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
    return parseURL(value)
  },
  parseLiteral: (ast) => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`URL must be a string, not a ${ast.kind}`, {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
    return parseURL(ast.value)
  }
}

export default URL
