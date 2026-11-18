import {GraphQLError} from 'graphql'
import {Kind} from 'graphql/language'
import isValidDate from 'parabol-client/utils/isValidDate'
import type {DateTimeScalarConfig} from '../resolverTypes'

function parseDate(value: string) {
  const result = new Date(value)
  if (!isValidDate(result) || Number.isNaN(result.getTime())) {
    throw new GraphQLError(`Invalid date: ${value}`, {extensions: {code: 'BAD_USER_INPUT'}})
  }
  if (value !== result.toJSON()) {
    if (!result.toJSON().startsWith(value)) {
      throw new GraphQLError(
        `Invalid date format, only accepts: YYYY-MM-DDTHH:MM:SS.SSSZ: ${value}`,
        {extensions: {code: 'BAD_USER_INPUT'}}
      )
    }
  }
  return result
}

const DateTime: DateTimeScalarConfig = {
  name: 'DateTime',

  serialize(value) {
    const date = new Date(value as string)
    if (isNaN(date.getTime())) {
      throw new GraphQLError('Field error: value is an invalid Date', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    }
    return date.toJSON()
  },

  parseValue(value) {
    if (typeof value !== 'string') {
      throw new GraphQLError(`DateTime must be a string, not ${typeof value}`, {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
    return parseDate(value)
  },

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`DateTime must be a string, not a ${ast.kind}`, {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
    return parseDate(ast.value)
  }
}

export default DateTime
