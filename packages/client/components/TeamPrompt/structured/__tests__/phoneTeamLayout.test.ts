import {nextLayoutForPhoneChoice, toPhoneLayout} from '../useTeamLayoutPreference'

test('grid and feed both read as the person view on phones', () => {
  expect(toPhoneLayout('grid')).toBe('person')
  expect(toPhoneLayout('feed')).toBe('person')
})

test('byQuestion reads as the question view on phones', () => {
  expect(toPhoneLayout('byQuestion')).toBe('question')
})

test('tapping the already-selected pill changes nothing', () => {
  expect(nextLayoutForPhoneChoice('grid', 'person')).toBe(null)
  expect(nextLayoutForPhoneChoice('feed', 'person')).toBe(null)
  expect(nextLayoutForPhoneChoice('byQuestion', 'question')).toBe(null)
})

test('tapping the other pill maps onto the desktop preference', () => {
  expect(nextLayoutForPhoneChoice('grid', 'question')).toBe('byQuestion')
  expect(nextLayoutForPhoneChoice('feed', 'question')).toBe('byQuestion')
  expect(nextLayoutForPhoneChoice('byQuestion', 'person')).toBe('feed')
})

test('a phone round trip is stable', () => {
  const feed = nextLayoutForPhoneChoice('byQuestion', 'person')
  const byQuestion = nextLayoutForPhoneChoice('feed', 'question')
  expect(feed && toPhoneLayout(feed)).toBe('person')
  expect(byQuestion && toPhoneLayout(byQuestion)).toBe('question')
})
