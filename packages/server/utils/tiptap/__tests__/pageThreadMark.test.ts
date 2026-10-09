import {TiptapTransformer} from '@hocuspocus/transformer'
import {getSchema, type JSONContent} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import {absolutePositionToRelativePosition, initProseMirrorDoc} from '@tiptap/y-tiptap'
import * as Y from 'yjs'
import {PageCommentMarkBase} from '../../../../client/shared/tiptap/extensions/PageCommentMarkBase'
import {markPageThread, unmarkPageThread} from '../pageThreadMark'

const extensions = [StarterKit, PageCommentMarkBase]
const schema = getSchema(extensions)

const paragraph = (...content: JSONContent[]) => ({type: 'paragraph', content})
const text = (value: string, marks?: JSONContent['marks']) => ({type: 'text', text: value, marks})

const makeDoc = (...content: JSONContent[]) =>
  TiptapTransformer.toYdoc({type: 'doc', content}, 'default', extensions)

// what the client does with its selection before calling the mutation
const encodePosition = (doc: Y.Doc, pos: number) => {
  const fragment = doc.getXmlFragment('default')
  const {meta} = initProseMirrorDoc(fragment, schema)
  const relativePosition = absolutePositionToRelativePosition(pos, fragment, meta.mapping)
  return Buffer.from(Y.encodeRelativePosition(relativePosition)).toString('base64')
}

const getMarkedText = (doc: Y.Doc, threadId: string) => {
  const marked: string[] = []
  const visit = (node: JSONContent) => {
    const isMarked = node.marks?.some(
      (mark) => mark.type === 'pageComment' && mark.attrs?.threadId === threadId
    )
    if (isMarked && node.text) marked.push(node.text)
    node.content?.forEach(visit)
  }
  visit(TiptapTransformer.fromYdoc(doc, 'default'))
  return marked
}

describe('markPageThread', () => {
  it('marks a range inside a paragraph', () => {
    const doc = makeDoc(paragraph(text('hello brave new world')))
    const quote = markPageThread(doc, 't1', encodePosition(doc, 7), encodePosition(doc, 16))
    expect(quote).toBe('brave new')
    expect(getMarkedText(doc, 't1')).toEqual(['brave new'])
  })

  it('marks a range that spans blocks and formatted text', () => {
    const doc = makeDoc(
      paragraph(text('first '), text('bold', [{type: 'bold'}]), text(' line')),
      paragraph(text('second line'))
    )
    const quote = markPageThread(doc, 't1', encodePosition(doc, 7), encodePosition(doc, 24))
    expect(quote).toBe('bold line second')
    expect(getMarkedText(doc, 't1')).toEqual(['bold', ' line', 'second'])
  })

  it('lets threads overlap', () => {
    const doc = makeDoc(paragraph(text('hello brave new world')))
    markPageThread(doc, 't1', encodePosition(doc, 1), encodePosition(doc, 12))
    markPageThread(doc, 't2', encodePosition(doc, 7), encodePosition(doc, 22))
    expect(getMarkedText(doc, 't1').join('')).toBe('hello brave')
    expect(getMarkedText(doc, 't2').join('')).toBe('brave new world')
  })

  it('writes the same attribute name the client binding writes', () => {
    const doc = makeDoc(paragraph(text('hello world')))
    markPageThread(doc, 't1', encodePosition(doc, 1), encodePosition(doc, 6))
    const clientDoc = makeDoc(
      paragraph(text('hello', [{type: 'pageComment', attrs: {threadId: 't1'}}]), text(' world'))
    )
    const getDelta = (yDoc: Y.Doc) => {
      const block = yDoc.getXmlFragment('default').get(0) as Y.XmlElement
      return (block.get(0) as Y.XmlText).toDelta()
    }
    expect(getDelta(doc)).toEqual(getDelta(clientDoc))
  })

  it('follows the text when the doc changed after the positions were made', () => {
    const doc = makeDoc(paragraph(text('hello brave new world')))
    const anchor = encodePosition(doc, 7)
    const head = encodePosition(doc, 12)
    const block = doc.getXmlFragment('default').get(0) as Y.XmlElement
    ;(block.get(0) as Y.XmlText).insert(0, 'well, ')
    expect(markPageThread(doc, 't1', anchor, head)).toBe('brave')
    expect(getMarkedText(doc, 't1')).toEqual(['brave'])
  })

  it('rejects positions that do not describe a range of text', () => {
    const doc = makeDoc(paragraph(text('hello world')))
    const start = encodePosition(doc, 1)
    const end = encodePosition(doc, 6)
    expect(markPageThread(doc, 't1', end, start)).toBeNull()
    expect(markPageThread(doc, 't1', start, start)).toBeNull()
    expect(markPageThread(doc, 't1', 'not a position', end)).toBeNull()
    expect(markPageThread(doc, 't1', encodePosition(doc, 6), encodePosition(doc, 7))).toBeNull()
    expect(getMarkedText(doc, 't1')).toEqual([])
  })
})

describe('unmarkPageThread', () => {
  it('removes only the marks of that thread', () => {
    const doc = makeDoc(paragraph(text('hello brave new world')), paragraph(text('second line')))
    markPageThread(doc, 't1', encodePosition(doc, 1), encodePosition(doc, 30))
    markPageThread(doc, 't2', encodePosition(doc, 7), encodePosition(doc, 12))
    unmarkPageThread(doc, 't1')
    expect(getMarkedText(doc, 't1')).toEqual([])
    expect(getMarkedText(doc, 't2')).toEqual(['brave'])
  })
})
