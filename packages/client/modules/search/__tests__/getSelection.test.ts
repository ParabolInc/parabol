import {getSelection} from '../getSelection'

describe('getSelection', () => {
  it('keeps the selected page when it is still listed', () => {
    expect(getSelection(['a', 'b', 'c'], 'b')).toEqual({index: 1, id: 'b'})
  })

  it('selects the first result when the selected page is gone', () => {
    expect(getSelection(['a', 'c'], 'b')).toEqual({index: 0, id: 'a'})
  })

  it('selects nothing when nothing was selected', () => {
    expect(getSelection(['a'], null)).toEqual({index: -1, id: null})
  })

  it('keeps the selection through an empty list', () => {
    expect(getSelection([], 'b')).toEqual({index: -1, id: 'b'})
  })

  it('keeps the highlighted result when a later list brings back an older selection', () => {
    const quick = getSelection(['y', 'z'], 'x')
    expect(getSelection(['z', 'x', 'y'], quick.id)).toEqual({index: 2, id: 'y'})
  })
})
