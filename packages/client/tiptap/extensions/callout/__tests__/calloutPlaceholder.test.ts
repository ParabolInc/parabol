import '../../__tests__/installHappyDom'
import {Editor} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {Focus, Placeholder} from '@tiptap/extensions'
import {CalloutBase} from '../../../../shared/tiptap/extensions/CalloutBase'
import {serverTipTapExtensions} from '../../../../shared/tiptap/serverTipTapExtensions'
import {pagePlaceholderText} from '../../../pagePlaceholderText'
import {happyWindow} from '../../__tests__/installHappyDom'
import {Callout} from '../Callout'

type Json = Record<string, unknown>
const p = (text = ''): Json => ({type: 'paragraph', content: text ? [{type: 'text', text}] : []})
const titled = (text: string): Json => ({type: 'calloutTitle', content: [{type: 'text', text}]})
const callout = (content: Json[]): Json => ({type: 'callout', attrs: {tone: 'info'}, content})
const TITLE = {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Title'}]}

const CalloutWithoutReact = Callout.extend({
  addNodeView() {
    return null
  }
})

const extensions = [
  Document.extend({content: 'heading block*'}),
  ...serverTipTapExtensions.map((extension) => {
    if (extension.name === 'starterKit') {
      return extension.configure({document: false, trailingNode: {node: 'paragraph'}})
    }
    return extension === CalloutBase ? CalloutWithoutReact : extension
  }),
  Focus,
  Placeholder.configure({
    showOnlyWhenEditable: false,
    includeChildren: true,
    placeholder: pagePlaceholderText
  })
]

let editor: Editor | undefined

const createEditor = (blocks: Json[]) => {
  editor = new Editor({
    element: document.body.appendChild(document.createElement('div')),
    extensions,
    content: {type: 'doc', content: [TITLE, ...blocks]}
  })
  return editor
}

const bodyParagraphs = (activeEditor: Editor) => {
  const found: HTMLElement[] = []
  activeEditor.state.doc.descendants((node, pos, parent) => {
    if (node.type.name === 'paragraph' && parent?.type.name === 'callout') {
      found.push(activeEditor.view.nodeDOM(pos) as HTMLElement)
    }
  })
  return found
}

afterEach(() => {
  editor?.destroy()
  editor = undefined
  document.body.replaceChildren()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

test('content ending in an empty paragraph lands on a short page', () => {
  const activeEditor = createEditor([p()])
  const longText = 'word '.repeat(60)
  expect(() =>
    activeEditor
      .chain()
      .focus('end')
      .insertContent([p(longText), p()])
      .run()
  ).not.toThrow()
  expect(activeEditor.state.doc.textContent).toContain(longText.trim())
})

test('a new callout says New callout in its only empty body line', () => {
  const activeEditor = createEditor([p()])
  activeEditor.chain().setTextSelection(8).setCallout().run()
  const [body] = bodyParagraphs(activeEditor)
  expect(body?.getAttribute('data-callout-placeholder')).toBe('New callout')
})

test('a titled callout with one empty body line says New callout there', () => {
  const activeEditor = createEditor([callout([titled('Heads up'), p()])])
  expect(bodyParagraphs(activeEditor)[0]?.getAttribute('data-callout-placeholder')).toBe(
    'New callout'
  )
})

test('a callout with two body lines has no New callout', () => {
  const activeEditor = createEditor([callout([p(), p()])])
  const marked = bodyParagraphs(activeEditor).filter((body) =>
    body.hasAttribute('data-callout-placeholder')
  )
  expect(marked).toEqual([])
})

test('a body line with text has no New callout', () => {
  const activeEditor = createEditor([callout([p('words')])])
  expect(bodyParagraphs(activeEditor)[0]?.hasAttribute('data-callout-placeholder')).toBe(false)
})
