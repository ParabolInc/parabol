import {planChunkReuse} from '../../../embedder/planChunkReuse'

const rows = (...embedTexts: string[]) =>
  embedTexts.map((embedText, chunkNumber) => ({id: 100 + chunkNumber, chunkNumber, embedText}))

it('keeps a chunk that moved', () =>
  expect(planChunkReuse(rows('A', 'B'), ['X', 'A', 'B'])).toEqual({
    deleteIds: [],
    toEmbed: [{chunkIndex: 0, chunkNumber: 2}]
  }))

it('deletes chunks that disappeared', () =>
  expect(planChunkReuse(rows('A', 'B', 'C'), ['A', 'C'])).toEqual({deleteIds: [101], toEmbed: []}))

it('gives new chunks the lowest free numbers', () =>
  expect(planChunkReuse(rows('A', 'B', 'C'), ['A', 'X', 'C'])).toEqual({
    deleteIds: [101],
    toEmbed: [{chunkIndex: 1, chunkNumber: 1}]
  }))

it('keeps duplicate chunks apart', () =>
  expect(planChunkReuse(rows('A', 'A'), ['A', 'A', 'A'])).toEqual({
    deleteIds: [],
    toEmbed: [{chunkIndex: 2, chunkNumber: 2}]
  }))

it('matches the whole embedded text', () =>
  expect(planChunkReuse(rows('Old\n\nbody'), ['New\n\nbody'])).toEqual({
    deleteIds: [100],
    toEmbed: [{chunkIndex: 0, chunkNumber: 0}]
  }))

it('embeds every chunk of a page without rows', () =>
  expect(planChunkReuse([], ['A', 'B'])).toEqual({
    deleteIds: [],
    toEmbed: [
      {chunkIndex: 0, chunkNumber: 0},
      {chunkIndex: 1, chunkNumber: 1}
    ]
  }))
