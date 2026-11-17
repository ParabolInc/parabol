import {Kind} from 'graphql'
import Email from '../Email'

test('trims and lowercases a variable', () => {
  expect(Email.parseValue!('  Jane@Example.COM ')).toBe('jane@example.com')
})

test.each([
  'jane',
  'jane@example',
  'two@example.com,three@example.com',
  'Jane <jane@example.com>',
  '"jane"@example.com',
  42
])('rejects the variable %j', (value) => {
  expect(() => Email.parseValue!(value)).toThrow()
})

test('parses literals with the same rules', () => {
  expect(Email.parseLiteral!({kind: Kind.STRING, value: 'Jane@Example.com'}, {})).toBe(
    'jane@example.com'
  )
  expect(() => Email.parseLiteral!({kind: Kind.STRING, value: 'a@b.com;c@d.com'}, {})).toThrow(
    'Not a valid email address'
  )
  expect(() => Email.parseLiteral!({kind: Kind.INT, value: '4'}, {})).toThrow()
})
