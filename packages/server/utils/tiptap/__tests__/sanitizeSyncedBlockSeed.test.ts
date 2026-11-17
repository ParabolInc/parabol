import {sanitizeSyncedBlockSeed} from '../sanitizeSyncedBlockSeed'

const paragraph = {type: 'paragraph', content: [{type: 'text', text: 'Call on-call first'}]}

test('keeps valid blocks and drops invalid ones', () => {
  expect(sanitizeSyncedBlockSeed([paragraph, {type: 'notANode'}])).toEqual([paragraph])
})

test.each(['pageLinkBlock', 'thinkingBlock', 'fileUpload'])('drops %s at any depth', (type) => {
  const dropped = {type}
  const seed = [
    dropped,
    {type: 'blockquote', content: [paragraph, dropped]},
    {type: 'bulletList', content: [{type: 'listItem', content: [paragraph, dropped]}]}
  ]
  expect(sanitizeSyncedBlockSeed(seed)).toEqual([
    {type: 'blockquote', content: [paragraph]},
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
    {type: 'paragraph'}
  ])
  expect(sanitizeSyncedBlockSeed([null, 'x', paragraph])).toEqual([paragraph])
})

test('drops nodes that cannot sit directly under the page', () => {
  const listItem = {type: 'listItem', content: [paragraph]}
  expect(sanitizeSyncedBlockSeed([{type: 'text', text: 'loose'}, listItem, paragraph])).toEqual([
    paragraph
  ])
})

test("normalizes kept blocks to the schema's JSON", () => {
  const seed = [
    {type: 'heading', content: [{type: 'text', text: 'Steps'}]},
    {
      type: 'paragraph',
      attrs: {bogus: true},
      content: [{type: 'text', text: 'Bold', marks: [{type: 'bold', attrs: {junk: 1}}]}]
    }
  ]
  expect(sanitizeSyncedBlockSeed(seed)).toEqual([
    {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Steps'}]},
    {type: 'paragraph', content: [{type: 'text', text: 'Bold', marks: [{type: 'bold'}]}]}
  ])
})
