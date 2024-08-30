import {RRuleSet} from 'rrule-rust'
import RRuleScalarType from '../RRule'

test('Should not allow for NaN interval values', () => {
  const rrule = `DTSTART;TZID=America/Phoenix:20230121T090000
RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR`

  expect(() => {
    RRuleScalarType.parseValue?.(rrule)
  }).toThrow(new Error('RRULE interval must be an integer'))
})

test('Should not allow for interval values bigger than 52', () => {
  const rrule = `DTSTART;TZID=America/Phoenix:20230121T090000
RRULE:FREQ=WEEKLY;INTERVAL=53;BYDAY=MO,TU,WE,TH,FR`

  expect(() => {
    RRuleScalarType.parseValue?.(rrule.toString())
  }).toThrow(new Error('RRULE interval must be between 1 and 52'))
})

test('Should not allow for interval values smaller than 1', () => {
  const rrule = `DTSTART;TZID=America/Phoenix:20230121T090000
RRULE:FREQ=WEEKLY;INTERVAL=0;BYDAY=MO,TU,WE,TH,FR`

  expect(() => {
    RRuleScalarType.parseValue?.(rrule.toString())
  }).toThrow(new Error('RRULE interval must be between 1 and 52'))
})

test('Should allow only WEEKLY frequency', () => {
  const rrule = `DTSTART;TZID=America/Phoenix:20230121T090000
RRULE:FREQ=DAILY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR`

  expect(() => {
    RRuleScalarType.parseValue?.(rrule.toString())
  }).toThrow(new Error('RRULE frequency must be WEEKLY'))
})

test('rrule-rust: TZID defaults to UTC', () => {
  const str = `DTSTART:20221119T090000Z
RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR`
  const rrule = RRuleSet.parse(str)
  const {tzid} = rrule
  expect(tzid).toBe('UTC')
})

test('rrule-rust: TZID extracted', () => {
  const str = `DTSTART;TZID=America/Los_Angeles:20230301T170000
RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=TU,WE,MO,TH`
  const rrule = RRuleSet.parse(str)
  const {tzid} = rrule
  expect(tzid).toBe('America/Los_Angeles')
})
