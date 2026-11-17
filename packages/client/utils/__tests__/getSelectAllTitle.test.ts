import getSelectAllTitle from '../getSelectAllTitle'

describe('getSelectAllTitle', () => {
  it('offers every unused story when none are selected', () => {
    expect(getSelectAllTitle(25, 0, 'issue', false)).toBe('Select all 25 issues')
  })

  it('counts only the unused stories when some are already selected', () => {
    expect(getSelectAllTitle(23, 11, 'issue', null)).toBe('Select all 23 issues')
  })

  it('offers the next batch when the story limit cuts the selection short', () => {
    expect(getSelectAllTitle(25, 40, 'issue', false)).toBe('Select next 10 issues')
  })

  it('uses the singular label for one story', () => {
    expect(getSelectAllTitle(3, 49, 'task', null)).toBe('Select next 1 task')
  })

  it('offers to deselect when every listed story is selected', () => {
    expect(getSelectAllTitle(0, 25, 'issue', true)).toBe('Deselect all')
  })

  it('offers to deselect at the story limit', () => {
    expect(getSelectAllTitle(10, 50, 'issue', true)).toBe('Deselect all')
  })
})
