import {Kind} from 'graphql'
import {Frequency, RRule} from 'rrule'
import {RRuleScalarConfig} from '../resolverTypes'

const isRRuleValid = (rrule: RRule) => {
  if (![Frequency.MONTHLY, Frequency.WEEKLY].includes(rrule.options.freq)) {
    return {
      error: 'Query error: RRule frequency must be yearly, monthly, or weekly'
    }
  }

  if (
    rrule.options.freq === Frequency.MONTHLY &&
    (rrule.options.interval < 1 || rrule.options.interval > 12)
  ) {
    return {
      error: 'Query error: For Frequency.MONTHLY RRule interval must be between 1 and 12'
    }
  }

  if (
    rrule.options.freq === Frequency.WEEKLY &&
    (rrule.options.interval < 1 || rrule.options.interval > 52)
  ) {
    return {
      error: 'Query error: For Frequency.WEEKLY RRule interval must be between 1 and 52'
    }
  }

  if (!rrule.options.tzid) {
    return {
      error: 'Query error: RRule must have a tzid'
    }
  }

  if (!rrule.options.dtstart) {
    return {
      error: 'Query error: RRule must have a dtstart'
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
      throw new Error(`Query error: RRule is not a string, it is a: ${ast.kind}`)
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
