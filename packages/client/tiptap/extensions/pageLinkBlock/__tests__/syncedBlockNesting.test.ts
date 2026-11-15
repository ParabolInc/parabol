import '../../__tests__/installHappyDom'
import {getPageFileType} from '../../../getPageFileType'
import {
  canNestSyncedBlock,
  getEnclosingChain,
  MAX_SYNCED_BLOCK_DEPTH,
  pageCodeFromPageId
} from '../syncedBlockNesting'

const csv = new File(['a,b'], 'data.csv', {type: 'text/csv'})
const xlsx = new File(['x'], 'data.xlsx', {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
})
const png = new File(['x'], 'a.png', {type: 'image/png'})

describe('synced block nesting', () => {
  test('the host page code starts the chain', () => {
    expect(getEnclosingChain(null, 'page:5')).toEqual([5])
    expect(pageCodeFromPageId('page:abc')).toBeUndefined()
  })

  test('a provided chain wins over the host page id', () => {
    expect(getEnclosingChain([5, 7], 'page:5')).toEqual([5, 7])
  })

  test('a block that contains a link to itself is not nested again', () => {
    expect(canNestSyncedBlock([5], 7)).toBe(true)
    expect(canNestSyncedBlock([5, 7], 7)).toBe(false)
  })

  test('a two-block cycle A to B to A stops at the second A', () => {
    expect(canNestSyncedBlock([5], 7)).toBe(true)
    expect(canNestSyncedBlock([5, 7], 8)).toBe(true)
    expect(canNestSyncedBlock([5, 7, 8], 7)).toBe(false)
  })

  test('the host page itself cannot be nested inside its own block', () => {
    expect(canNestSyncedBlock([5], 5)).toBe(false)
  })

  test('nesting stops after three blocks', () => {
    const chain = [5]
    for (let depth = 0; depth < MAX_SYNCED_BLOCK_DEPTH; depth++) {
      expect(canNestSyncedBlock(chain, 10 + depth)).toBe(true)
      chain.push(10 + depth)
    }
    expect(canNestSyncedBlock(chain, 99)).toBe(false)
  })
})

describe('getPageFileType', () => {
  test('a top-level page routes CSV and XLSX to database import', () => {
    expect(getPageFileType(csv, false)).toBe('csv')
    expect(getPageFileType(xlsx, false)).toBe('xlsx')
  })

  test('inside a synced block CSV and XLSX are plain files', () => {
    expect(getPageFileType(csv, true)).toBe('file')
    expect(getPageFileType(xlsx, true)).toBe('file')
  })

  test('images stay images in both', () => {
    expect(getPageFileType(png, true)).toBe('image')
    expect(getPageFileType(png, false)).toBe('image')
  })
})
