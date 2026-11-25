import {INVITEE_SEPARATOR, splitTypedInvitees} from '../inviteeInputText'

test('splitTypedInvitees keeps names whole', () => {
  expect(splitTypedInvitees('hana bhatt', true)).toEqual({commit: null, rest: 'hana bhatt'})
  expect(splitTypedInvitees('pat.ng@vendor.co ', true)).toEqual({
    commit: 'pat.ng@vendor.co',
    rest: ''
  })
  expect(splitTypedInvitees('pat.ng@vendor.co, jo', true)).toEqual({
    commit: 'pat.ng@vendor.co',
    rest: 'jo'
  })
})

test('splitTypedInvitees keeps the email-only behavior', () => {
  expect(splitTypedInvitees('bob ', false)).toEqual({commit: 'bob', rest: ''})
})

test('INVITEE_SEPARATOR matches the characters that split typed text', () => {
  expect([' ', ',', ';', '<', '>', '\t'].every((char) => INVITEE_SEPARATOR.test(char))).toBe(true)
  expect(INVITEE_SEPARATOR.test('pat.ng@vendor.co')).toBe(false)
  expect(splitTypedInvitees('a@b.co<c', false)).toEqual({commit: 'a@b.co', rest: 'c'})
})
