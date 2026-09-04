import {resolveSwipe} from '../useHorizontalSwipe'

describe('resolveSwipe', () => {
  it('returns null when the horizontal distance is below the threshold', () => {
    expect(resolveSwipe(30, 0, 50)).toBeNull()
  })

  it('returns null when the vertical distance dominates', () => {
    expect(resolveSwipe(60, 50, 50)).toBeNull()
  })

  it('returns left for a leftward swipe past the threshold', () => {
    expect(resolveSwipe(-80, 0, 50)).toBe('left')
  })

  it('returns right for a rightward swipe past the threshold', () => {
    expect(resolveSwipe(80, 0, 50)).toBe('right')
  })

  it('treats the threshold as inclusive', () => {
    expect(resolveSwipe(49, 0, 50)).toBeNull()
    expect(resolveSwipe(50, 0, 50)).toBe('right')
  })
})
