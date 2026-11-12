import {getAnsweredSummary, getDrawerNote, getSwitchedMessage} from '../switchTemplateCopy'

describe('getAnsweredSummary', () => {
  it('speaks to the viewer when only they answered', () => {
    expect(getAnsweredSummary(1, true)).toBe(
      'You’ve started answering. Your answer will be cleared.'
    )
  })

  it('names the viewer first when others answered too', () => {
    expect(getAnsweredSummary(2, true)).toMatch(/^You and 1 other person have started answering/)
    expect(getAnsweredSummary(3, true)).toMatch(/^You and 2 others have started answering/)
  })

  it('counts people, never names them, when the viewer did not answer', () => {
    expect(getAnsweredSummary(1, false)).toMatch(/^1 person has started answering/)
    expect(getAnsweredSummary(3, false)).toBe(
      '3 people have started answering. Their answers, including private drafts, will be cleared.'
    )
  })
})

describe('getDrawerNote', () => {
  it('matches who answered', () => {
    expect(getDrawerNote(1, true)).toMatch(/^You have started answering/)
    expect(getDrawerNote(3, true)).toMatch(/^You and 2 others have/)
    expect(getDrawerNote(2, false)).toMatch(/^2 people have/)
  })
})

describe('getSwitchedMessage', () => {
  it('adds only the sentences that apply', () => {
    expect(getSwitchedMessage('Demo day', false, false)).toBe('The template changed to Demo day.')
    expect(getSwitchedMessage('Demo day', true, true)).toBe(
      'The template changed to Demo day. Answers were cleared. Future meetings in this series will use it too.'
    )
  })
})
