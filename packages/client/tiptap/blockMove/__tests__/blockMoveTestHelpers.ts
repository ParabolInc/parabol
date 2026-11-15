import '../../extensions/__tests__/installHappyDom'
import {Editor, getSchema, type JSONContent} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {prosemirrorJSONToYXmlFragment, yXmlFragmentToProsemirrorJSON} from '@tiptap/y-tiptap'
import * as Y from 'yjs'
import {serverTipTapExtensions} from '../../../shared/tiptap/serverTipTapExtensions'

export const extensions = [
  Document.extend({content: 'heading block*'}),
  ...serverTipTapExtensions.map((extension) =>
    extension.name === 'starterKit'
      ? extension.configure({document: false, trailingNode: {node: 'paragraph'}})
      : extension
  )
]

export const schema = getSchema(extensions)

export const p = (text: string): JSONContent => ({
  type: 'paragraph',
  content: [{type: 'text', text}]
})
export const h = (level: number, text: string): JSONContent => ({
  type: 'heading',
  attrs: {level},
  content: [{type: 'text', text}]
})
export const li = (text: string): JSONContent => ({type: 'listItem', content: [p(text)]})
export const toggle = (summary: string, ...children: JSONContent[]): JSONContent => ({
  type: 'details',
  content: [
    {type: 'detailsSummary', content: [{type: 'text', text: summary}]},
    {type: 'detailsContent', content: children}
  ]
})
export const link = (pageCode: number, title: string, canonical: boolean): JSONContent => ({
  type: 'pageLinkBlock',
  attrs: {pageCode, title, canonical}
})

let editors: Editor[] = []
export const makeEditor = (...blocks: JSONContent[]) => {
  const editor = new Editor({
    element: document.createElement('div'),
    extensions,
    content: {type: 'doc', content: [h(1, 'Title'), ...blocks]}
  })
  editors.push(editor)
  return editor
}
export const destroyEditors = () => {
  editors.forEach((editor) => {
    editor.destroy()
  })
  editors = []
}

export const rangeOf = (editor: Editor, typeName: string, index: number) => {
  const matches: {from: number; to: number}[] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === typeName) matches.push({from: pos, to: pos + node.nodeSize})
  })
  return matches[index]!
}

export const normalize = (blocks: JSONContent[]) =>
  blocks.map((block) => schema.nodeFromJSON(block).toJSON() as JSONContent)

export const seed = (...blocks: JSONContent[]) => {
  const doc = new Y.Doc()
  const frag = doc.getXmlFragment('default')
  prosemirrorJSONToYXmlFragment(schema, {type: 'doc', content: blocks}, frag)
  return frag
}
export const read = (frag: Y.XmlFragment) =>
  normalize((yXmlFragmentToProsemirrorJSON(frag).content ?? []) as JSONContent[])
