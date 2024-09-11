import {Kind} from 'graphql'
import {Frequency, RRuleSet} from 'rrule-rust'
import {RRuleScalarConfig} from '../resolverTypes'

const isRRuleValid = (rrule: RRuleSet) => {
  const {tzid, rrules} = rrule
  const [firstRule] = rrules
  if (!firstRule || rrules.length > 1) {
    // this is just for us, it's not part of the spec
    throw new Error('Exactly 1 RRule must exist in an RRule Set')
  }
  const {interval, frequency, count} = firstRule
  if (!Number.isSafeInteger(interval)) {
    throw new Error('RRULE interval must be an integer')
  }

  const isWithinRange = interval && interval >= 1 && interval <= 52
  if (!isWithinRange) {
    throw new Error('RRULE interval must be between 1 and 52')
  }

  if (frequency !== Frequency.Weekly) {
    throw new Error('RRULE frequency must be WEEKLY')
  }

  // using count option is not allowed
  if (count !== null && count !== undefined) {
    throw new Error('RRULE count option is not supported')
  }

  try {
    Intl.DateTimeFormat(undefined, {timeZone: tzid!})
  } catch (e) {
    throw new Error('RRULE time zone is invalid')
  }
}

const RRuleScalarType: RRuleScalarConfig = {
  name: 'RRule',
  description: 'A custom scalar type for representing RRule strings',
  parseValue(value: unknown) {
    if (typeof value !== 'string') {
      throw new Error(`RRule is not a string, it is a: ${typeof value}`)
    }
    const rrule = RRuleSet.parse(value)
    isRRuleValid(rrule)
    return rrule
  },
  serialize(value: unknown) {
    return (value as RRuleSet).toString()
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new Error(`RRule is not a string, it is a: ${ast.kind}`)
    }
    const rrule = RRuleSet.parse(ast.value)
    isRRuleValid(rrule)
    return rrule
  }
}

export default RRuleScalarType
