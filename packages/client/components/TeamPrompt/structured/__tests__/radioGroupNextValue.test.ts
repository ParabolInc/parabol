import radioGroupNextValue, {tablistNextValue} from '../radioGroupNextValue'

const VALUES = ['person', 'question'] as const

describe('radioGroupNextValue', () => {
  test('horizontal arrows wrap around the group', () => {
    expect(radioGroupNextValue(VALUES, 'person', 'ArrowRight')).toBe('question')
    expect(radioGroupNextValue(VALUES, 'question', 'ArrowRight')).toBe('person')
    expect(radioGroupNextValue(VALUES, 'person', 'ArrowLeft')).toBe('question')
  })

  test('vertical arrows move too, as APG requires of a radio group', () => {
    expect(radioGroupNextValue(VALUES, 'person', 'ArrowDown')).toBe('question')
    expect(radioGroupNextValue(VALUES, 'question', 'ArrowUp')).toBe('person')
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
})

describe('tablistNextValue', () => {
  test('horizontal arrows wrap around the row', () => {
    expect(tablistNextValue(VALUES, 'person', 'ArrowRight')).toBe('question')
    expect(tablistNextValue(VALUES, 'question', 'ArrowRight')).toBe('person')
    expect(tablistNextValue(VALUES, 'person', 'ArrowLeft')).toBe('question')
  })

  test('vertical arrows are left to the page so a horizontal row never blocks scrolling', () => {
    expect(tablistNextValue(VALUES, 'person', 'ArrowDown')).toBe(null)
    expect(tablistNextValue(VALUES, 'question', 'ArrowUp')).toBe(null)
  })

  test('Home and End still jump to the edges', () => {
    expect(tablistNextValue(VALUES, 'question', 'Home')).toBe('person')
    expect(tablistNextValue(VALUES, 'person', 'End')).toBe('question')
  })

  test('other keys and an unknown current value are ignored', () => {
    expect(tablistNextValue(VALUES, 'person', 'Enter')).toBe(null)
    expect(tablistNextValue(['grid', 'feed'], 'byQuestion', 'ArrowLeft')).toBe(null)
  })
})
