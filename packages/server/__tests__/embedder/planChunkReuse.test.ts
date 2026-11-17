import {planChunkReuse, planPositionalReuse} from '../../../embedder/planChunkReuse'

const rows = (...embedTexts: string[]) =>
  embedTexts.map((embedText, chunkNumber) => ({id: 100 + chunkNumber, chunkNumber, embedText}))

it('keeps a chunk that moved', () =>
  expect(planChunkReuse(rows('A', 'B'), ['X', 'A', 'B'])).toEqual({
    deleteIds: [],
    toEmbed: [{chunkIndex: 0, chunkNumber: 2}]
  }))

it('deletes chunks that disappeared', () =>
  expect(planChunkReuse(rows('A', 'B', 'C'), ['A', 'C'])).toEqual({deleteIds: [101], toEmbed: []}))

it('gives new chunks numbers no existing row holds', () =>
  expect(planChunkReuse(rows('A', 'B', 'C'), ['A', 'X', 'C'])).toEqual({
    deleteIds: [101],
    toEmbed: [{chunkIndex: 1, chunkNumber: 3}]
  }))

it('keeps duplicate chunks apart', () =>
  expect(planChunkReuse(rows('A', 'A'), ['A', 'A', 'A'])).toEqual({
    deleteIds: [],
    toEmbed: [{chunkIndex: 2, chunkNumber: 2}]
  }))

it('matches the whole embedded text', () =>
  expect(planChunkReuse(rows('Old\n\nbody'), ['New\n\nbody'])).toEqual({
    deleteIds: [100],
    toEmbed: [{chunkIndex: 0, chunkNumber: 1}]
  }))

it('embeds every chunk of a page without rows', () =>
  expect(planChunkReuse([], ['A', 'B'])).toEqual({
    deleteIds: [],
    toEmbed: [
      {chunkIndex: 0, chunkNumber: 0},
      {chunkIndex: 1, chunkNumber: 1}
    ]
  }))

it('fills a gap in the chunk numbers without touching a kept row', () => {
  const gapped = [
    {id: 100, chunkNumber: 3, embedText: 'A'},
    {id: 101, chunkNumber: 4, embedText: 'B'},
    {id: 102, chunkNumber: 5, embedText: 'C'}
  ]
  expect(planChunkReuse(gapped, ['A', 'X', 'C'])).toEqual({
    deleteIds: [101],
    toEmbed: [{chunkIndex: 1, chunkNumber: 0}]
  })
})

describe('by position', () => {
  it('re-embeds every chunk that moved', () =>
    expect(planPositionalReuse(rows('A', 'B'), ['X', 'A', 'B'])).toEqual({
      deleteIds: [],
      toEmbed: [
        {chunkIndex: 0, chunkNumber: 0},
        {chunkIndex: 1, chunkNumber: 1},
        {chunkIndex: 2, chunkNumber: 2}
      ]
    }))

  it('keeps a chunk in its place', () =>
    expect(planPositionalReuse(rows('A', 'B'), ['A', 'X'])).toEqual({
      deleteIds: [],
      toEmbed: [{chunkIndex: 1, chunkNumber: 1}]
    }))

  it('deletes the rows past the last chunk', () =>
    expect(planPositionalReuse(rows('A', 'B', 'C'), ['A'])).toEqual({
      deleteIds: [101, 102],
      toEmbed: []
    }))
})
