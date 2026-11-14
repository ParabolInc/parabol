import type {JSONContent} from '@tiptap/core'
import {isStandupResponseTooLong, STANDUP_RESPONSE_CHARACTER_LIMIT} from '../standupResponseLength'

const paragraph = (text?: string): JSONContent => ({
  type: 'paragraph',
  content: text ? [{type: 'text', text}] : undefined
})

const doc = (content: JSONContent[]): JSONContent => ({type: 'doc', content})

const textAtLimit = 'a'.repeat(STANDUP_RESPONSE_CHARACTER_LIMIT)

describe('isStandupResponseTooLong', () => {
  it('accepts text exactly at the limit', () => {
    expect(isStandupResponseTooLong(doc([paragraph(textAtLimit)]))).toBe(false)
  })

  it('rejects text one character over the limit', () => {
    expect(isStandupResponseTooLong(doc([paragraph(`${textAtLimit}a`)]))).toBe(true)
  })

  it('does not count paragraph breaks, matching the editor', () => {
    const emptyLines = Array.from({length: 1000}, () => paragraph())
    expect(isStandupResponseTooLong(doc([paragraph(textAtLimit), ...emptyLines]))).toBe(false)
  })

  it('counts a hard break as one character', () => {
    const lineWithBreak = paragraph(textAtLimit)
    lineWithBreak.content?.push({type: 'hardBreak'})
    expect(isStandupResponseTooLong(doc([lineWithBreak]))).toBe(true)
  })
})
