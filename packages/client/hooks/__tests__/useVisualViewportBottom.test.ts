import {visualViewportBottom} from '../useVisualViewportBottom'

describe('visualViewportBottom', () => {
  it('returns 0 when the viewport fills the window', () => {
    expect(visualViewportBottom(800, 800, 0)).toBe(0)
  })

  it('returns the gap left by a software keyboard', () => {
    expect(visualViewportBottom(800, 500, 0)).toBe(300)
  })

  it('accounts for a scrolled offsetTop', () => {
    expect(visualViewportBottom(800, 500, 20)).toBe(280)
  })

  it('clamps a negative result to 0', () => {
    expect(visualViewportBottom(800, 850, 0)).toBe(0)
  })

  it('rounds a fractional result', () => {
    expect(visualViewportBottom(800.6, 500.2, 0)).toBe(300)
  })
})
