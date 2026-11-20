import {GraphQLError} from 'graphql'
import {Kind} from 'graphql/language'
import isValidDate from 'parabol-client/utils/isValidDate'
import type {DateTimeScalarConfig} from '../resolverTypes'

const zonedTimestamp = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/

function parseDate(value: string) {
  const result = new Date(value)
  if (!isValidDate(result)) {
    throw new GraphQLError(`Invalid date: ${value}`, {extensions: {code: 'BAD_USER_INPUT'}})
  }
  const wallClock = zonedTimestamp.exec(value)?.[1]
  const canonical = wallClock ? new Date(`${wallClock}Z`).toJSON() : result.toJSON()
  if (!canonical.startsWith(wallClock ?? value)) {
    throw new GraphQLError(
      `Invalid date, expected an ISO 8601 timestamp with a time zone, like 2024-03-15T14:30:00Z: ${value}`,
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
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
