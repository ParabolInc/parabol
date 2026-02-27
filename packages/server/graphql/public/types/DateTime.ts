import {Kind} from 'graphql/language'
import isValidDate from 'parabol-client/utils/isValidDate'
import type {DateTimeScalarConfig} from '../resolverTypes'

function parseDate(value: string) {
  const result = new Date(value)
  if (!isValidDate(result)) {
    throw new Error(`Invalid date: ${value}`)
  }
  if (value !== result.toJSON()) {
    throw new Error(`Invalid date format, only accepts: YYYY-MM-DDTHH:MM:SS.SSSZ: ${value}`)
  }
  return result
}

const DateTime: DateTimeScalarConfig = {
  name: 'DateTime',

  serialize(value) {
    const date = new Date(value as string)
    if (isNaN(date.getTime())) {
      throw new Error('Field error: value is an invalid Date')
    }
    return date.toJSON()
  },

  parseValue(value) {
    if (typeof value !== 'string') {
      throw new Error('Field error: value is not an instance of string')
    }
    return parseDate(value)
  },

  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new Error(`Query error: Can only parse strings to dates but got a: ${ast.kind}`)
    }
    try {
      return parseDate(ast.value)
    } catch (e) {
      throw new Error(`Query error: ${e instanceof Error ? e.message : 'Unable to parseDate'}`)
    }
  }
}

export default DateTime
