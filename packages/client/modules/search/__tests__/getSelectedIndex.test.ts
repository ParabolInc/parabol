import {getSelectedIndex} from '../getSelectedIndex'

describe('getSelectedIndex', () => {
  it('keeps the selected page when it is still listed', () => {
    expect(getSelectedIndex(['a', 'b', 'c'], 'b')).toBe(1)
  })

  it('selects the first result when the selected page is gone', () => {
    expect(getSelectedIndex(['a', 'c'], 'b')).toBe(0)
  })

  it('selects nothing when nothing was selected', () => {
    expect(getSelectedIndex(['a'], null)).toBe(-1)
  })

  it('selects nothing in an empty list', () => {
    expect(getSelectedIndex([], 'b')).toBe(-1)
  })
})
