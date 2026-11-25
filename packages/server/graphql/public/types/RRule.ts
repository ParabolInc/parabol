import {GraphQLError, Kind} from 'graphql'
import {Frequency, RRuleSet} from 'rrule-rust'
import type {RRuleScalarConfig} from '../resolverTypes'

const parseRRuleSet = (raw: string) => {
  try {
    return RRuleSet.parse(raw)
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e)
    throw new GraphQLError(`RRULE could not be parsed: ${reason}`, {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
}

const validateRRule = (raw: string) => {
  const rrule = parseRRuleSet(raw)
  const {tzid, rrules} = rrule
  const [firstRule] = rrules
  if (!firstRule || rrules.length > 1) {
    // this is just for us, it's not part of the spec
    throw new GraphQLError('Exactly 1 RRule must exist in an RRule Set', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  const {frequency, count} = firstRule
  const interval = firstRule.interval ?? 1
  if (!Number.isSafeInteger(interval)) {
    throw new GraphQLError('RRULE interval must be an integer', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  const isWithinRange = interval && interval >= 1 && interval <= 52
  if (!isWithinRange) {
    throw new GraphQLError('RRULE interval must be between 1 and 52', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  if (frequency !== Frequency.Weekly) {
    throw new GraphQLError('RRULE frequency must be WEEKLY', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  // using count option is not allowed
  if (count !== null && count !== undefined) {
    throw new GraphQLError('RRULE count option is not supported', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  try {
    Intl.DateTimeFormat(undefined, {timeZone: tzid!})
  } catch {
    throw new GraphQLError('RRULE time zone is invalid', {extensions: {code: 'BAD_USER_INPUT'}})
  }
  return raw
}

const RRuleScalarType: RRuleScalarConfig = {
  name: 'RRule',
  parseValue(value: unknown) {
    if (typeof value !== 'string') {
      throw new GraphQLError(`RRule is not a string, it is a: ${typeof value}`, {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
    return validateRRule(value)
  },
  serialize(value: unknown) {
    return String(value)
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`RRule is not a string, it is a: ${ast.kind}`, {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
    return validateRRule(ast.value)
  }
}

export default RRuleScalarType
