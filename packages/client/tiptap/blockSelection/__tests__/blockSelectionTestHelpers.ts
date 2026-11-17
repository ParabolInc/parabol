import type {Editor, JSONContent} from '@tiptap/core'
import type {BlockRange} from '../blockUnits'

export const posInText = (editor: Editor, text: string) => {
  let found = -1
  editor.state.doc.descendants((node, pos) => {
    if (found === -1 && node.isText && node.text === text) found = pos + 1
  })
  if (found === -1) throw new Error(`No text node "${text}"`)
  return found
}

const childrenIn = (editor: Editor, range: BlockRange) => {
  const children: {name: string; text: string}[] = []
  editor.state.doc.nodesBetween(range.from, range.to, (node, pos) => {
    if (pos < range.from || pos + node.nodeSize > range.to) return true
    children.push({name: node.type.name, text: node.textContent})
    return false
  })
  return children
}

export const textsIn = (editor: Editor, range: BlockRange) =>
  childrenIn(editor, range).map(({text}) => text)

export const nodeNamesIn = (editor: Editor, range: BlockRange) =>
  childrenIn(editor, range).map(({name}) => name)

const cell = (text: string): JSONContent => ({
  type: 'tableCell',
  content: [{type: 'paragraph', content: [{type: 'text', text}]}]
})

export const table2x2 = (): JSONContent => ({
  type: 'table',
  content: [
    {type: 'tableRow', content: [cell('c1'), cell('c2')]},
    {type: 'tableRow', content: [cell('c3'), cell('c4')]}
  ]
})

export const callout = (title: string, ...body: JSONContent[]): JSONContent => ({
  type: 'callout',
  content: [{type: 'calloutTitle', content: [{type: 'text', text: title}]}, ...body]
})
