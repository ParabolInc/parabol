import {Kind} from 'graphql'
import {Frequency, RRule} from 'rrule'
import {RRuleScalarConfig} from '../resolverTypes'

const isRRuleValid = (rrule: RRule) => {
  if (rrule.options.freq !== Frequency.WEEKLY) {
    return {
      error: 'RRule frequency must be WEEKLY'
    }
  }

  if (isNaN(rrule.options.interval)) {
    return {
      error: 'RRule interval must be a number'
    }
  }

  if (rrule.options.interval < 1 || rrule.options.interval > 52) {
    return {
      error: 'RRule interval must be between 1 and 52'
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
