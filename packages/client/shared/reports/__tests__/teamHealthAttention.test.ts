import {
  combineTeamHealthAttention,
  markTeamHealthCells,
  toTeamHealthAttentionInputs,
  toTeamHealthAttentionLevel,
  toTeamHealthDeviation
} from '../teamHealthAttention'

const attentionOf = (sentimentScore: number | null, deviation: number | null, share: number) =>
  combineTeamHealthAttention(
    toTeamHealthAttentionInputs({sentimentScore, deviation, commentedShare: share})
  )

const cell = (rawAttention: number, sentimentScore: number | null = 0, commentedShare = 0.2) => ({
  rawAttention,
  sentimentScore,
  commentedShare
})

test('only the negative side of the summary counts', () => {
  const [positive] = toTeamHealthAttentionInputs({
    sentimentScore: 0.7,
    deviation: 1,
    commentedShare: 0.3
  })
  const [negative] = toTeamHealthAttentionInputs({
    sentimentScore: -0.6,
    deviation: 1,
    commentedShare: 0.3
  })
  expect(positive!.value).toBe(0)
  expect(negative!.value).toBeCloseTo(0.6)
})

test('the spread and the share who commented scale between their ends', () => {
  const [, closeTogether, few] = toTeamHealthAttentionInputs({
    sentimentScore: 0,
    deviation: 0.5,
    commentedShare: 0.05
  })
  const [, farApart, most] = toTeamHealthAttentionInputs({
    sentimentScore: 0,
    deviation: 1.6,
    commentedShare: 0.8
  })
  expect(closeTogether!.value).toBe(0)
  expect(few!.value).toBe(0)
  expect(farApart!.value).toBe(1)
  expect(most!.value).toBe(1)
})

test('a missing input hands its weight to the others', () => {
  expect(attentionOf(-1, 1.4, 0.6)).toBeCloseTo(1)
  expect(attentionOf(-1, null, 0.6)).toBeCloseTo(1)
  expect(attentionOf(null, 1.4, 0.6)).toBeCloseTo(1)
  expect(attentionOf(-0.98, 1.18, 4 / 7)).toBeCloseTo(0.907, 3)
})

test('the share who commented never marks a cell alone', () => {
  expect(attentionOf(null, null, 1)).toBe(0)
})

test('the deviation is spread over everyone who answered', () => {
  expect(toTeamHealthDeviation([1, 1, 2, 2, 3, 4, 4])).toBeCloseTo(1.178, 3)
  expect(toTeamHealthDeviation([3, 3, 3, 3])).toBe(0)
})

test('levels start at 0.5, 0.75 and 0.9', () => {
  expect(toTeamHealthAttentionLevel(0.49)).toBeNull()
  expect(toTeamHealthAttentionLevel(0.5)).toBe('LOW')
  expect(toTeamHealthAttentionLevel(0.75)).toBe('MEDIUM')
  expect(toTeamHealthAttentionLevel(0.9)).toBe('HIGH')
})

test('a calm report has no marks', () => {
  const marks = markTeamHealthCells(Array.from({length: 30}, (_, idx) => cell(idx / 100)))
  expect(marks.every(({mark}) => mark === null)).toBe(true)
})

test('no more than 1 cell in 5 needs attention, and the rest are squeezed under 0.5', () => {
  const cells = Array.from({length: 10}, (_, idx) => cell(0.5 + idx / 20))
  const marks = markTeamHealthCells(cells)
  const marked = marks.filter(({mark}) => mark !== null)
  expect(marked.map(({cell}) => cell.rawAttention).sort()).toEqual([0.9, 0.95])
  expect(marks.filter(({mark}) => mark === null).every(({attention}) => attention < 0.5)).toBe(true)
  const attentions = marks.map(({attention}) => attention)
  expect([...attentions].sort((a, b) => a - b)).toEqual(attentions)
})

test('bright spots fill the room cells needing attention leave, most positive first', () => {
  const cells = [
    cell(0.9, -0.9),
    cell(0.1, 0.92),
    cell(0.1, 0.88),
    cell(0.1, 0.81),
    cell(0.1, 0.5),
    cell(0.1, 0.2),
    cell(0.1, 0.1),
    cell(0.1, 0),
    cell(0.1, 0),
    cell(0.1, 0)
  ]
  const marks = markTeamHealthCells(cells).map(({mark}) => mark)
  expect(marks.slice(0, 4)).toEqual(['HIGH', 'BRIGHT_SPOT', null, null])
})

test('cells needing attention leave no room for bright spots when they fill it', () => {
  const cells = [cell(0.8), cell(0.7), ...Array.from({length: 8}, () => cell(0.05, 0.95))]
  const marks = markTeamHealthCells(cells)
  expect(marks.filter(({mark}) => mark === 'BRIGHT_SPOT')).toHaveLength(0)
  expect(marks.filter(({mark}) => mark !== null)).toHaveLength(2)
})
