import type {JSONContent} from '@tiptap/core'
import {convertToMarkdown} from '../convertToMarkdown'

const text = (value: string): JSONContent => ({type: 'text', text: value})
const paragraph = (value: string): JSONContent => ({type: 'paragraph', content: [text(value)]})
const title = (value: string): JSONContent => ({type: 'calloutTitle', content: [text(value)]})
const callout = (tone: string, content: JSONContent[]): JSONContent => ({
  type: 'callout',
  attrs: {tone, emoji: null},
  content
})

describe('convertToMarkdown callouts', () => {
  test('renders a titled callout as a Slack quote with a bold first line', () => {
    expect(
      convertToMarkdown(callout('warning', [title('Freeze'), paragraph('Merge by noon')]))
    ).toBe('> *Freeze*\n> Merge by noon')
  })

  test('renders an untitled callout as a Slack quote', () => {
    expect(convertToMarkdown(callout('info', [paragraph('One'), paragraph('Two')]))).toBe(
      '> One\n> Two'
    )
  })

  test('prefixes every line of multi-line children', () => {
    const list: JSONContent = {
      type: 'bulletList',
      content: [
        {type: 'listItem', content: [paragraph('a')]},
        {type: 'listItem', content: [paragraph('b')]}
      ]
    }
    expect(convertToMarkdown(callout('info', [title('T'), list]))).toBe('> *T*\n> • a\n> • b')
  })
})
