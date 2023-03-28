import {RRule} from 'rrule'
import RRuleScalarType from '../RRule'

test('Should not allow for NaN interval values', () => {
  const rrule = new RRule({
    freq: RRule.WEEKLY,
    interval: NaN,
    dtstart: new Date(),
    tzid: 'America/Los_Angeles'
  })

  expect(() => {
    RRuleScalarType.parseValue?.(rrule.toString())
  }).toThrow(new Error('RRule interval must be an integer'))
})

test('Should not allow for interval values bigger than 52', () => {
  const rrule = new RRule({
    freq: RRule.WEEKLY,
    interval: 53,
    dtstart: new Date(),
    tzid: 'America/Los_Angeles'
  })

  expect(() => {
    RRuleScalarType.parseValue?.(rrule.toString())
  }).toThrow(new Error('RRule interval must be between 1 and 52'))
})

test('Should not allow for interval values smaller than 1', () => {
  const rrule = new RRule({
    freq: RRule.WEEKLY,
    interval: 0,
    dtstart: new Date(),
    tzid: 'America/Los_Angeles'
  })

  expect(() => {
    RRuleScalarType.parseValue?.(rrule.toString())
  }).toThrow(new Error('RRule interval must be between 1 and 52'))
})

test('Should not allow for negative interval values', () => {
  const rrule = new RRule({
    freq: RRule.WEEKLY,
    interval: -1,
    dtstart: new Date(),
    tzid: 'America/Los_Angeles'
  })

  expect(() => {
    RRuleScalarType.parseValue?.(rrule.toString())
  }).toThrow(new Error('RRule interval must be between 1 and 52'))
})

test('Should allow only WEEKLY frequency', () => {
  const rrule = new RRule({
    freq: RRule.DAILY,
    interval: 1,
    dtstart: new Date(),
    tzid: 'America/Los_Angeles'
  })

  expect(() => {
    RRuleScalarType.parseValue?.(rrule.toString())
  }).toThrow(new Error('RRule frequency must be WEEKLY'))
})

test('Should allow only interval values between 1 and 52', () => {
  const rrule = new RRule({
    freq: RRule.WEEKLY,
    interval: 53,
    dtstart: new Date(),
    tzid: 'America/Los_Angeles'
  })

  expect(() => {
    RRuleScalarType.parseValue?.(rrule.toString())
  }).toThrow(new Error('RRule interval must be between 1 and 52'))
})

test('Should not allow for missing tzid', () => {
  const rrule = new RRule({
    freq: RRule.WEEKLY,
    interval: 1,
    dtstart: new Date()
  })

  expect(() => {
    RRuleScalarType.parseValue?.(rrule.toString())
  }).toThrow(new Error('RRule must have a tzid'))
})

test('Should not allow for using count option', () => {
  const rrule = new RRule({
    freq: RRule.WEEKLY,
    interval: 1,
    count: 0,
    dtstart: new Date(),
    tzid: 'America/Los_Angeles'
  })

  expect(() => {
    RRuleScalarType.parseValue?.(rrule.toString())
  }).toThrow(new Error('RRule count option is not supported'))
})
