import {isValidInviteeEmail} from '../../shared/teamInviteeEmail'
import splitEmailList from '../splitEmailList'

describe('splitEmailList', () => {
  it.each([
    ['a@a.co', ['a@a.co']],
    ['a@a.co, ', ['a@a.co']],
    ['a@a.co,\nb@b.co', ['a@a.co', 'b@b.co']],
    ['a@a.co\nb@b.co', ['a@a.co', 'b@b.co']],
    ['a@a.co;\nb@b.co', ['a@a.co', 'b@b.co']],
    ['a@a.co\tb@b.co  c@c.co', ['a@a.co', 'b@b.co', 'c@c.co']],
    ['  Jane@Example.COM  ', ['jane@example.com']],
    ['a@a.co, A@a.co', ['a@a.co']]
  ])('splits %j', (text, expected) => {
    expect(splitEmailList(text)).toEqual(expected)
  })

  it('reads Gmail and Outlook copies, dropping the display names', () => {
    const gmail = 'Jane Doe <jane@example.com>, Rob Roe <rob@example.com>'
    const outlook = '"Doe, Jane" <jane@example.com>; Roe, Rob <rob@example.com>'
    expect(splitEmailList(gmail)).toEqual(['jane@example.com', 'rob@example.com'])
    expect(splitEmailList(outlook)).toEqual(['jane@example.com', 'rob@example.com'])
  })

  it('reads a spreadsheet row and strips mailto links and trailing punctuation', () => {
    expect(splitEmailList('Jane\tDoe\tjane@example.com\n')).toEqual(['jane@example.com'])
    expect(splitEmailList('mailto:jane@example.com.')).toEqual(['jane@example.com'])
  })

  it('keeps a lone word without an @ so it can be flagged', () => {
    expect(splitEmailList('jane')).toEqual(['jane'])
  })
})

describe('isValidInviteeEmail', () => {
  it.each(['a@b.co', 'a.b+c@sub.example.co.uk', 'ü@bücher.de'])('accepts %s', (email) => {
    expect(isValidInviteeEmail(email)).toBe(true)
  })

  it.each([
    'jane',
    'a@b',
    'a@b.',
    'a@.b.com',
    'a@b..com',
    'a b@c.com',
    'a,b@c.com',
    'a@b.com,c@d.com',
    '"a"@b.com',
    '<a@b.com>',
    `${'a'.repeat(250)}@b.com`
  ])('rejects %s', (email) => {
    expect(isValidInviteeEmail(email)).toBe(false)
  })
})
