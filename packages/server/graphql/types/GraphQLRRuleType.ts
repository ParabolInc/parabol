import {GraphQLScalarType, Kind} from 'graphql'
import {Frequency, RRule} from 'rrule'

export const RRuleScalarType = new GraphQLScalarType({
  name: 'RRule',
  description: 'A custom scalar type for representing RRule strings',
  parseValue(value: string) {
    return RRule.fromString(value)
  },
  serialize(value: RRule) {
    return value.toString()
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new Error(`Query error: RRule is not a string, it is a: ${ast.kind}`)
    }

    const rrule = RRule.fromString(ast.value)
    if (![Frequency.YEARLY, Frequency.MONTHLY, Frequency.WEEKLY].includes(rrule.options.freq)) {
      throw new Error(`Query error: RRule must have a freq of WEEKLY, MONTHLY or YEARLY`)
    }

    if (rrule.options.interval < 1 || rrule.options.interval > 12) {
      throw new Error('Query error: RRule interval must be between 1 and 12')
    }

    if (!rrule.options.tzid) {
      throw new Error('Query error: RRule must have a tzid')
    }

    if (!rrule.options.dtstart) {
      throw new Error('Query error: RRule must have a dtstart')
    }

    return rrule
  }
})
