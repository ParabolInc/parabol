import '../../../tiptap/extensions/__tests__/installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import type {Node as ProseMirrorNode} from '@tiptap/pm/model'
import {calloutToneFromAlertType} from '../calloutTones'
import {serverTipTapExtensions} from '../serverTipTapExtensions'

const text = (value: string): JSONContent => ({type: 'text', text: value})
const p = (value: string): JSONContent => ({type: 'paragraph', content: [text(value)]})
const title = (value: string): JSONContent => ({type: 'calloutTitle', content: [text(value)]})
const bullets = (value: string): JSONContent => ({
  type: 'bulletList',
  content: [{type: 'listItem', content: [p(value)]}]
})
const callout = (tone: string, content: JSONContent[]): JSONContent => ({
  type: 'callout',
  attrs: {tone, emoji: null},
  content
})

const makeEditor = (content: JSONContent[]) =>
  new Editor({
    element: undefined,
    content: {type: 'doc', content},
    extensions: serverTipTapExtensions
  })

const makeEditorFromHTML = (html: string) =>
  new Editor({element: undefined, content: html, extensions: serverTipTapExtensions})

const posInside = (editor: Editor, needle: string) => {
  let found = -1
  editor.state.doc.descendants((node, pos) => {
    if (found === -1 && node.isText && node.text?.includes(needle)) found = pos
  })
  return found
}

const hasCalloutInsideCallout = (doc: ProseMirrorNode) => {
  let nested = false
  doc.descendants((node) => {
    if (node.type.name !== 'callout') return
    node.descendants((child) => {
      if (child.type.name === 'callout') nested = true
    })
  })
  return nested
}

describe('callout schema', () => {
  test('accepts a titled callout holding a paragraph and a list', () => {
    const editor = makeEditor([
      callout('warning', [title('Freeze'), p('Merge by noon'), bullets('one')])
    ])
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'callout',
      attrs: {tone: 'warning', emoji: null}
    })
  })

  test('treats an unknown tone as plain', () => {
    const editor = makeEditorFromHTML('<div data-type="callout" data-tone="success"><p>x</p></div>')
    expect(editor.getJSON().content?.[0]?.attrs?.tone).toBe('plain')
  })

  test('renders role note named by its tone', () => {
    expect(makeEditor([callout('danger', [p('x')])]).getHTML()).toContain(
      'role="note" aria-label="Danger"'
    )
  })

  test('pasting a callout inside a callout keeps all text and never nests', () => {
    const editor = makeEditor([callout('info', [p('outer one'), p('outer two')])])
    editor.commands.insertContentAt(posInside(editor, 'outer one'), callout('tip', [p('inner')]))
    const json = JSON.stringify(editor.getJSON())
    expect(json).toContain('outer one')
    expect(json).toContain('outer two')
    expect(json).toContain('inner')
    expect(hasCalloutInsideCallout(editor.state.doc)).toBe(false)
  })

  test('parses a GitHub-rendered alert and drops its label line', () => {
    const html =
      '<div class="markdown-alert markdown-alert-warning"><p class="markdown-alert-title">Warning</p><p>Merge by noon</p></div>'
    const node = makeEditorFromHTML(html).getJSON().content?.[0]
    expect(node).toMatchObject({type: 'callout', attrs: {tone: 'warning'}})
    expect(JSON.stringify(node)).not.toContain('"Warning"')
  })

  test('calloutToneFromAlertType maps GitHub, Obsidian and unknown types', () => {
    expect(calloutToneFromAlertType('NOTE')).toBe('info')
    expect(calloutToneFromAlertType('success')).toBe('tip')
    expect(calloutToneFromAlertType('Caution')).toBe('danger')
    expect(calloutToneFromAlertType('quote')).toBe('plain')
  })
})
