import type {JSONContent} from '@tiptap/core'
import {createHash} from 'crypto'
import generateHeavyCorpus from '../heavyCorpus/generateHeavyCorpus'
import toFixture from '../toFixture'

const PINNED_DIGEST = '2493f1cb1e7d8a03e9cf0338db339211ddf794ab6e9ade3dbfe6f7f5ba431173'

const pages = generateHeavyCorpus()
const fixtures = pages.map(({key, content, updatedAt}) => toFixture(key, content, updatedAt))
const lengths = fixtures.map(({plaintextContent}) => plaintextContent.length).sort((a, b) => a - b)
const quantile = (q: number) => lengths[Math.floor(q * (lengths.length - 1))]!
const shareOfPages = (predicate: (length: number) => boolean) =>
  lengths.filter(predicate).length / lengths.length
const countKeys = (pattern: RegExp) => pages.filter(({key}) => pattern.test(key)).length
const countResponses = (content: JSONContent) =>
  (content.content ?? []).filter(({type}) => type === 'responseBlock').length

describe('generateHeavyCorpus', () => {
  it('generates the same corpus every time', () => {
    expect(JSON.stringify(generateHeavyCorpus())).toBe(JSON.stringify(pages))
  })

  it('has the page mix of a heavy account', () => {
    expect(pages).toHaveLength(244)
    expect(countKeys(/-standup-\d{4}-\d{2}-\d{2}$/)).toBe(190)
    expect(countKeys(/-retro-\d+$/)).toBe(18)
    expect(countKeys(/-poker-\d+$/)).toBe(18)
    expect(countKeys(/-meeting-summaries$/)).toBe(2)
    expect(countKeys(/^doc-/)).toBe(16)
  })

  it('gives every page a unique title', () => {
    const titles = fixtures.map(({title}) => title)
    expect(titles.every(Boolean)).toBe(true)
    expect(new Set(titles).size).toBe(titles.length)
  })

  it('matches the length mix of heavy accounts', () => {
    expect(shareOfPages((length) => length < 200)).toBeGreaterThanOrEqual(0.18)
    expect(shareOfPages((length) => length < 200)).toBeLessThanOrEqual(0.3)
    expect(quantile(0.5)).toBeGreaterThanOrEqual(1500)
    expect(quantile(0.5)).toBeLessThanOrEqual(2500)
    expect(shareOfPages((length) => length > 1500)).toBeGreaterThanOrEqual(0.48)
    expect(shareOfPages((length) => length > 1500)).toBeLessThanOrEqual(0.64)
    expect(quantile(0.9)).toBeGreaterThanOrEqual(4500)
    expect(quantile(0.9)).toBeLessThanOrEqual(7500)
  })

  it('answers standups like heavy accounts do', () => {
    const responseCounts = pages
      .filter(({key}) => key.includes('-standup-'))
      .map(({content}) => countResponses(content))
    const headerOnly = responseCounts.filter((count) => count === 0).length / responseCounts.length
    expect(headerOnly).toBeGreaterThanOrEqual(0.18)
    expect(headerOnly).toBeLessThanOrEqual(0.35)
    const answered = responseCounts.filter((count) => count > 0).sort((a, b) => a - b)
    const median = answered[Math.floor(answered.length / 2)]!
    expect(median).toBeGreaterThanOrEqual(2)
    expect(median).toBeLessThanOrEqual(4)
  })

  it('keeps the corpus that the query labels describe', () => {
    const digest = createHash('sha256').update(JSON.stringify(pages)).digest('hex')
    if (digest !== PINNED_DIGEST) {
      throw new Error(
        `The heavy corpus changed (digest ${digest}). Recheck the labels in heavyQueries.json and heavyHoldoutQueries.json against the EVAL_DUMP=1 output, reseed with EVAL_RESEED=1, then set PINNED_DIGEST to the new digest.`
      )
    }
  })
})
