import radioGroupNextValue from '../radioGroupNextValue'

const VALUES = ['person', 'question'] as const

test('arrow keys wrap around the group', () => {
  expect(radioGroupNextValue(VALUES, 'person', 'ArrowRight')).toBe('question')
  expect(radioGroupNextValue(VALUES, 'question', 'ArrowRight')).toBe('person')
  expect(radioGroupNextValue(VALUES, 'person', 'ArrowLeft')).toBe('question')
})

test('vertical arrows are left to the page so a horizontal row never blocks scrolling', () => {
  expect(radioGroupNextValue(VALUES, 'person', 'ArrowDown')).toBe(null)
  expect(radioGroupNextValue(VALUES, 'question', 'ArrowUp')).toBe(null)
})

test('Home and End jump to the edges', () => {
  expect(radioGroupNextValue(VALUES, 'question', 'Home')).toBe('person')
  expect(radioGroupNextValue(VALUES, 'person', 'End')).toBe('question')
})

test('other keys are ignored', () => {
  expect(radioGroupNextValue(VALUES, 'person', 'Enter')).toBe(null)
  expect(radioGroupNextValue(VALUES, 'person', 'a')).toBe(null)
})

test('an unknown current value is ignored', () => {
  expect(radioGroupNextValue(['grid', 'feed'], 'byQuestion', 'ArrowRight')).toBe(null)
})
