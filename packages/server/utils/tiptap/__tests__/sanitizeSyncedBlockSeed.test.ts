import {sanitizeSyncedBlockSeed} from '../sanitizeSyncedBlockSeed'

const paragraph = {type: 'paragraph', content: [{type: 'text', text: 'Call on-call first'}]}

test('keeps valid blocks and drops invalid ones', () => {
  expect(sanitizeSyncedBlockSeed([paragraph, {type: 'notANode'}])).toEqual([paragraph])
})

test('drops page links nested inside lists', () => {
  const seed = [
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [paragraph, {type: 'pageLinkBlock', attrs: {pageCode: 7, title: 'Runbook'}}]
        }
      ]
    }
  ]
  expect(sanitizeSyncedBlockSeed(seed)).toEqual([
    {type: 'bulletList', content: [{type: 'listItem', content: [paragraph]}]}
  ])
})

test('returns nothing for a seed that is not an array', () => {
  expect(sanitizeSyncedBlockSeed('x')).toEqual([])
  expect(sanitizeSyncedBlockSeed(null)).toEqual([])
  expect(sanitizeSyncedBlockSeed({})).toEqual([])
})

test('drops malformed nodes without throwing', () => {
  expect(sanitizeSyncedBlockSeed([paragraph, {type: 'paragraph', content: 'x'}])).toEqual([
    paragraph
  ])
  expect(sanitizeSyncedBlockSeed([paragraph, {type: 'paragraph', content: [null]}])).toEqual([
    paragraph,
    {type: 'paragraph', content: []}
  ])
  expect(sanitizeSyncedBlockSeed([null, 'x', paragraph])).toEqual([paragraph])
})

test('drops nodes that cannot sit directly under the page', () => {
  const listItem = {type: 'listItem', content: [paragraph]}
  expect(sanitizeSyncedBlockSeed([{type: 'text', text: 'loose'}, listItem, paragraph])).toEqual([
    paragraph
  ])
})
