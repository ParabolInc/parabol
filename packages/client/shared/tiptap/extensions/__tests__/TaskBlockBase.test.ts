import '../../../../tiptap/extensions/__tests__/installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import {happyWindow} from '../../../../tiptap/extensions/__tests__/installHappyDom'
import {serverTipTapExtensions} from '../../serverTipTapExtensions'

Object.defineProperty(globalThis, 'ClipboardEvent', {
  value: happyWindow.ClipboardEvent,
  configurable: true,
  writable: true
})

const taskContent = JSON.stringify({
  type: 'doc',
  content: [{type: 'paragraph', content: [{type: 'text', text: 'Ship the widget'}]}]
})

const renderedBlockView = (dataType: string) =>
  `<div class="react-renderer node-${dataType}"><div data-type="taskBlock" data-node-view-wrapper="" style="white-space: normal;"><div><div contenteditable="false" class="tiptap ProseMirror"><p>Ship the widget</p></div></div><div><div>Sam Sample</div></div></div></div>`

let editor: Editor | undefined
const makeEditor = (content: JSONContent[] = [{type: 'paragraph'}]) => {
  editor = new Editor({
    element: document.createElement('div'),
    extensions: serverTipTapExtensions,
    content: {type: 'doc', content}
  })
  return editor
}

const blocksOfType = (activeEditor: Editor, type: string) =>
  (activeEditor.getJSON().content ?? []).filter((node) => node.type === type)

afterEach(() => {
  editor?.destroy()
  editor = undefined
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

describe('pasting HTML into a page', () => {
  test.each([
    ['a task block', 'taskBlock'],
    ['a response block', 'responseBlock']
  ])('keeps the text of %s view copied by the browser without making an empty block', (_, type) => {
    const activeEditor = makeEditor()
    activeEditor.view.pasteHTML(renderedBlockView(type))
    expect(blocksOfType(activeEditor, 'taskBlock')).toEqual([])
    expect(() => activeEditor.getText()).not.toThrow()
    expect(activeEditor.getText()).toContain('Ship the widget')
  })

  test('ignores a response block element without content', () => {
    const activeEditor = makeEditor()
    activeEditor.view.pasteHTML(
      '<div data-type="responseBlock" data-preferredname="Sam Sample"><p>Ship the widget</p></div>'
    )
    expect(blocksOfType(activeEditor, 'responseBlock')).toEqual([])
    expect(() => activeEditor.getText()).not.toThrow()
  })

  test('keeps a task block copied from a page', () => {
    const source = makeEditor([
      {
        type: 'taskBlock',
        attrs: {content: taskContent, preferredName: 'Sam Sample', status: 'done'}
      }
    ])
    const html = source.getHTML()
    source.destroy()
    const activeEditor = makeEditor()
    activeEditor.view.pasteHTML(html)
    const [taskBlock] = blocksOfType(activeEditor, 'taskBlock')
    expect(taskBlock?.attrs).toMatchObject({
      content: taskContent,
      preferredName: 'Sam Sample',
      status: 'done'
    })
    expect(activeEditor.getText()).toContain('Task: Ship the widget')
  })
})

describe('a page that already holds a block without content', () => {
  test.each(['taskBlock', 'responseBlock'])('still has text for its %s', (type) => {
    const activeEditor = makeEditor([
      {type: 'paragraph', content: [{type: 'text', text: 'Notes'}]},
      {type, attrs: {content: '', preferredName: 'Sam Sample'}}
    ])
    expect(activeEditor.getText()).toContain('Notes')
  })
})
