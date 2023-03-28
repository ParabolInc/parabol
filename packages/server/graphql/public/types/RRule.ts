import {Kind} from 'graphql'
import {Frequency, RRule} from 'rrule'
import {RRuleScalarConfig} from '../resolverTypes'

const isRRuleValid = (rrule: RRule) => {
  try {
    // kinda hacky, but that way we're getting rid of most of the RRule quirks
    // Interval has to be an integer within 1 and 52 range, otherwise RRule may misbehave
    rrule.options.interval = parseInt(rrule.options.interval.toString())

    const isValidNumber =
      !isNaN(rrule.options.interval) &&
      rrule.options.interval !== undefined &&
      rrule.options.interval !== null
    if (!isValidNumber) {
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
  } catch (e) {
    return {
      error: `RRule interval must be an integer`
    }
  }

  if (rrule.options.freq !== Frequency.WEEKLY) {
    return {
      error: 'RRule frequency must be WEEKLY'
    }
  }

  // using count option is not allowed
  if (rrule.options.count !== null && rrule.options.count >= 0) {
    return {
      error: 'RRule count option is not supported'
    }
  }

  if (!rrule.options.tzid) {
    return {
      error: 'RRule must have a tzid'
    }
  }

  if (!rrule.options.dtstart) {
    return {
      error: 'RRule must have a dtstart'
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
