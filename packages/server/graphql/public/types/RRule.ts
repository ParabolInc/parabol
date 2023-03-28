import {Kind} from 'graphql'
import isValidDate from 'parabol-client/utils/isValidDate'
import {Frequency, RRule} from 'rrule'
import {RRuleScalarConfig} from '../resolverTypes'

const isRRuleValid = (rrule: RRule) => {
  const {options} = rrule
  const {interval, freq, count, tzid, dtstart} = options
  if (!Number.isSafeInteger(interval)) {
    return {
      error: 'RRule interval must be an integer'
    }
  }

  const isWithinRange = rrule.options.interval >= 1 && rrule.options.interval <= 52
  if (!isWithinRange) {
    return {
      error: 'RRule interval must be between 1 and 52'
    }
  }

  if (freq !== Frequency.WEEKLY) {
    return {
      error: 'RRule frequency must be WEEKLY'
    }
  }

  // using count option is not allowed
  if (count !== null) {
    return {
      error: 'RRule count option is not supported'
    }
  }

  try {
    Intl.DateTimeFormat(undefined, {timeZone: tzid!})
  } catch (e) {
    return {
      error: 'RRule time zone is invalid'
    }
  }

  if (!isValidDate(dtstart)) {
    return {
      error: 'RRule dtstart is invalid'
    }
  }

  return {error: null}
}

const RRuleScalarType: RRuleScalarConfig = {
  name: 'RRule',
  description: 'A custom scalar type for representing RRule strings',
  parseValue(value: string) {
    const rrule = RRule.fromString(value)
    const {error} = isRRuleValid(rrule)
    if (error) {
      throw new Error(error)
    }

    return rrule
  },
  serialize(value: RRule) {
    return value.toString()
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new Error(`RRule is not a string, it is a: ${ast.kind}`)
    }
    const rrule = RRule.fromString(ast.value)
    const {error} = isRRuleValid(rrule)
    if (error) {
      throw new Error(error)
    }

    return rrule
  }
}

export default RRuleScalarType
