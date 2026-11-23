import {GraphQLError, Kind} from 'graphql'
import DateTime from '../DateTime'

const parseVariable = (value: unknown) => (DateTime.parseValue!(value) as Date).toJSON()

test.each([
  ['2024-03-15T14:30:00.000Z', '2024-03-15T14:30:00.000Z'],
  ['2024-03-15T14:30:00Z', '2024-03-15T14:30:00.000Z'],
  ['2024-03-15T14:30:00.5Z', '2024-03-15T14:30:00.500Z'],
  ['2024-03-15T14:30:00.123456Z', '2024-03-15T14:30:00.123Z'],
  ['2024-03-15T14:30:00.1234567Z', '2024-03-15T14:30:00.123Z'],
  ['2024-03-15T14:30:00+00:00', '2024-03-15T14:30:00.000Z'],
  ['2024-03-15T16:30:00.123456+02:00', '2024-03-15T14:30:00.123Z'],
  ['2024-03-15T09:00:00-05:30', '2024-03-15T14:30:00.000Z'],
  ['2024-03-16T00:30:00+10:00', '2024-03-15T14:30:00.000Z'],
  ['2024-02-29T23:00:00-01:00', '2024-03-01T00:00:00.000Z'],
  ['2024-03-15', '2024-03-15T00:00:00.000Z']
])('parses the variable %j', (value, expected) => {
  expect(parseVariable(value)).toBe(expected)
})

test.each([
  'next week',
  '2024-13-15T14:30:00Z',
  '2023-02-29T14:30:00Z',
  '2023-02-29T14:30:00+02:00',
  '2024-03-15T24:00:00Z',
  '2024-03-15T14:30:00+24:00',
  '2024-03-15T14:30:00+0200',
  '2024-03-15 14:30:00Z',
  '2024-03-15T14:30:00.Z',
  '2024-03-15T14:30Z',
  '',
  42
])('rejects the variable %j as bad user input', (value) => {
  expect(() => DateTime.parseValue!(value)).toThrow(
    expect.objectContaining({extensions: {code: 'BAD_USER_INPUT'}})
  )
})

test('parses literals with the same rules', () => {
  expect(
    (
      DateTime.parseLiteral!({kind: Kind.STRING, value: '2024-03-15T16:30:00+02:00'}, {}) as Date
    ).toJSON()
  ).toBe('2024-03-15T14:30:00.000Z')
  expect(() =>
    DateTime.parseLiteral!({kind: Kind.STRING, value: '2023-02-29T14:30:00Z'}, {})
  ).toThrow(GraphQLError)
  expect(() => DateTime.parseLiteral!({kind: Kind.INT, value: '4'}, {})).toThrow(
    expect.objectContaining({extensions: {code: 'BAD_USER_INPUT'}})
  )
})
