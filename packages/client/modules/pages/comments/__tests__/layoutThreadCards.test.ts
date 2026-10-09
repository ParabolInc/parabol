import {layoutThreadCards} from '../layoutThreadCards'

const card = (id: string, anchorTop: number, height = 100) => ({id, anchorTop, height})

describe('layoutThreadCards', () => {
  it('puts each card next to its anchor when there is room', () => {
    const tops = layoutThreadCards([card('a', 50), card('b', 400)], null, 12)
    expect(tops).toEqual({a: 50, b: 400})
  })

  it('pushes a card down when the one above it is in the way', () => {
    const tops = layoutThreadCards([card('a', 50), card('b', 60), card('c', 70)], null, 12)
    expect(tops).toEqual({a: 50, b: 162, c: 274})
  })

  it('orders cards by their anchor, not by the order they were given in', () => {
    const tops = layoutThreadCards([card('late', 300), card('early', 10)], null, 12)
    expect(tops).toEqual({early: 10, late: 300})
  })

  it('keeps the active card next to its anchor by moving the cards above it up', () => {
    const tops = layoutThreadCards([card('a', 300), card('b', 310), card('c', 320)], 'c', 12)
    expect(tops).toEqual({a: 96, b: 208, c: 320})
  })

  it('never puts a card above the top, even if that moves the active card', () => {
    const tops = layoutThreadCards([card('a', 0), card('b', 10)], 'b', 12)
    expect(tops).toEqual({a: 0, b: 112})
  })

  it('pushes the cards below the active card down', () => {
    const tops = layoutThreadCards([card('a', 100), card('b', 110)], 'a', 12)
    expect(tops).toEqual({a: 100, b: 212})
  })
})
