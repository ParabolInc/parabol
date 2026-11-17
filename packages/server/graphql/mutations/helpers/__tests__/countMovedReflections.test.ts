import countMovedReflections from '../countMovedReflections'

const place = (suggested: string[][], final: string[][]) => {
  const suggestedKeyById = new Map(
    suggested.flatMap((ids, idx) => ids.map((id) => [id, `s${idx}`]))
  )
  return final.flatMap((ids, idx) =>
    ids.map((id) => ({suggestedGroupKey: suggestedKeyById.get(id)!, finalGroupKey: `f${idx}`}))
  )
}

test('kept suggestions need no moves', () => {
  expect(countMovedReflections(place([['a', 'b'], ['c']], [['c'], ['b', 'a']]))).toBe(0)
})

test('merging three suggested singletons takes two moves', () => {
  expect(countMovedReflections(place([['a'], ['b'], ['c']], [['a', 'b', 'c']]))).toBe(2)
})

test('pulling one card out of a suggested group takes one move', () => {
  expect(countMovedReflections(place([['a', 'b', 'c']], [['a', 'b'], ['c']]))).toBe(1)
})

test('a card that joins another suggested group counts once', () => {
  expect(
    countMovedReflections(
      place(
        [
          ['a', 'b'],
          ['c', 'd']
        ],
        [['a', 'b', 'c'], ['d']]
      )
    )
  ).toBe(1)
})

test('a board regrouped from scratch counts every card that changed company', () => {
  expect(
    countMovedReflections(
      place(
        [
          ['a', 'b'],
          ['c', 'd']
        ],
        [
          ['a', 'c'],
          ['b', 'd']
        ]
      )
    )
  ).toBe(2)
})
