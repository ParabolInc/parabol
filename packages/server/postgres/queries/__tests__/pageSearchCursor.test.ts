import {
  decodePageSearchCursor,
  encodePageSearchCursor,
  getPageSearchPageInfo
} from '../pageSearchCursor'

describe('page search cursor', () => {
  it.each([
    ['fused', 0],
    ['keyword', 1],
    ['recent', 40],
    ['fused', 2147483647]
  ] as const)('round-trips a %s position of %p', (ranking, position) =>
    expect(decodePageSearchCursor(encodePageSearchCursor(ranking, position))).toEqual({
      ranking,
      position
    })
  )

  it.each([
    ['text', 'not a cursor'],
    ['a cursor from before paging worked', btoa(JSON.stringify({codes: [1], maxScore: 0.5}))],
    ['a missing ranking', btoa(JSON.stringify({position: 3}))],
    ['an unknown ranking', btoa(JSON.stringify({ranking: 'vector', position: 3}))],
    ['a negative position', btoa(JSON.stringify({ranking: 'fused', position: -1}))],
    ['a fractional position', btoa(JSON.stringify({ranking: 'fused', position: 1.5}))],
    ['a string position', btoa(JSON.stringify({ranking: 'fused', position: '3'}))],
    ['a position past the int range', btoa(JSON.stringify({ranking: 'fused', position: 2 ** 31}))],
    ['null', btoa('null')],
    ['a bare number', btoa('5')]
  ])('rejects %s', (_label, cursor) => expect(decodePageSearchCursor(cursor)).toBeNull())

  it('describes a page in the middle of the results', () => {
    const pageInfo = getPageSearchPageInfo('fused', 20, 2, true)
    expect(pageInfo.hasNextPage).toBe(true)
    expect(pageInfo.hasPreviousPage).toBe(true)
    expect(decodePageSearchCursor(pageInfo.startCursor!)).toEqual({ranking: 'fused', position: 21})
    expect(decodePageSearchCursor(pageInfo.endCursor!)).toEqual({ranking: 'fused', position: 22})
  })

  it('describes an empty page past the end', () =>
    expect(getPageSearchPageInfo('keyword', 40, 0, false)).toEqual({
      hasNextPage: false,
      hasPreviousPage: true,
      startCursor: null,
      endCursor: null
    }))
})
