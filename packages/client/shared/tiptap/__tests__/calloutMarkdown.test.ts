import {Editor, type JSONContent} from '@tiptap/core'
import {CALLOUT_TONES} from '../calloutTones'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

const text = (value: string): JSONContent => ({type: 'text', text: value})
const p = (value: string): JSONContent => ({type: 'paragraph', content: [text(value)]})
const title = (value: string): JSONContent => ({type: 'calloutTitle', content: [text(value)]})
const bullets = (value: string): JSONContent => ({
  type: 'bulletList',
  content: [{type: 'listItem', content: [p(value)]}]
})
const code = (value: string): JSONContent => ({
  type: 'codeBlock',
  attrs: {language: null},
  content: [text(value)]
})
const callout = (
  tone: string,
  content: JSONContent[],
  attrs: Record<string, unknown> = {}
): JSONContent => ({
  type: 'callout',
  attrs: {tone, emoji: null, ...attrs},
  content
})

const makeEditor = (content: JSONContent[]) =>
  new Editor({
    element: undefined,
    content: {type: 'doc', content},
    extensions: serverTipTapExtensions
  })

const toMarkdown = (content: JSONContent[]) => makeEditor(content).getMarkdown()

const normalize = (content: JSONContent[]) => makeEditor(content).getJSON().content ?? []

const fromMarkdown = (markdown: string) =>
  new Editor({
    element: undefined,
    content: markdown,
    contentType: 'markdown',
    extensions: serverTipTapExtensions
  }).getJSON().content ?? []

describe('callout markdown', () => {
  test('writes a titled warning as a GitHub alert', () => {
    expect(toMarkdown([callout('warning', [title('Freeze'), p('Merge by noon')])])).toBe(
      '> [!WARNING] Freeze\n> Merge by noon'
    )
  })

  test('writes plain as [!PLAIN] and drops the emoji', () => {
    const md = toMarkdown([callout('plain', [p('Aside')], {emoji: '🚀'})])
    expect(md).toBe('> [!PLAIN]\n> Aside')
    expect(md).not.toContain('🚀')
  })

  test('round-trips every tone with title, list and code', () => {
    CALLOUT_TONES.forEach((tone) => {
      const doc = [callout(tone, [title('T'), p('a'), bullets('b'), code('c')])]
      expect(fromMarkdown(toMarkdown(doc))).toEqual(normalize(doc))
    })
  })

  test('reads Obsidian aliases case-insensitively', () => {
    expect(fromMarkdown('> [!danger] Stop\n> now')[0]).toMatchObject({
      type: 'callout',
      attrs: {tone: 'danger'}
    })
  })

  test('parses a title-only alert', () => {
    expect(fromMarkdown('> [!tip] Faster reviews')[0]).toMatchObject({
      type: 'callout',
      attrs: {tone: 'tip'},
      content: [
        {type: 'calloutTitle', content: [{type: 'text', text: 'Faster reviews'}]},
        {type: 'paragraph'}
      ]
    })
  })

  test('writes a title-only callout without a trailing empty quote line', () => {
    expect(toMarkdown(fromMarkdown('> [!tip] Faster reviews'))).toBe('> [!TIP] Faster reviews')
  })

  test('moves a table out of an alert to just after the callout', () => {
    const doc = fromMarkdown('> [!NOTE]\n> before\n>\n> | a |\n> |---|\n> | 1 |')
    expect(doc.map((node) => node.type)).toEqual(['callout', 'table'])
  })

  test('leaves an ordinary quote a quote', () => {
    expect(fromMarkdown('> just a quote')[0]?.type).toBe('blockquote')
  })
})
