import {fromPhoneLayout, toPhoneLayout} from '../useTeamLayoutPreference'

test('grid and feed both read as the person view on phones', () => {
  expect(toPhoneLayout('grid')).toBe('person')
  expect(toPhoneLayout('feed')).toBe('person')
})

test('byQuestion reads as the question view on phones', () => {
  expect(toPhoneLayout('byQuestion')).toBe('question')
})

test('phone choices map back onto the desktop preference', () => {
  expect(fromPhoneLayout('person')).toBe('feed')
  expect(fromPhoneLayout('question')).toBe('byQuestion')
})

test('a phone round trip is stable', () => {
  expect(toPhoneLayout(fromPhoneLayout('person'))).toBe('person')
  expect(toPhoneLayout(fromPhoneLayout('question'))).toBe('question')
})
