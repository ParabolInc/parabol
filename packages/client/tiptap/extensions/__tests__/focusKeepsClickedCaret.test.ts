import './installHappyDom'
import {Editor} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

type ViewWithInput = {input: {mouseDown: object | null}}

let editor: Editor | undefined
afterEach(() => {
  editor?.destroy()
  editor = undefined
})

const mount = () => {
  editor = new Editor({
    element: document.body.appendChild(document.createElement('div')),
    extensions: [StarterKit],
    content: '<p>first</p><p>second</p>'
  })
  editor.commands.setTextSelection(1)
  return editor
}

const putBrowserCaretAtEndOf = (activeEditor: Editor, text: string) => {
  const paragraph = [...activeEditor.view.dom.querySelectorAll('p')].find(
    (element) => element.textContent === text
  )!
  getSelection()!.collapse(paragraph.firstChild!, text.length)
}

const setMouseDown = (activeEditor: Editor, mouseDown: object | null) => {
  ;(activeEditor.view as unknown as ViewWithInput).input.mouseDown = mouseDown
}

describe('focusing the editor', () => {
  it('keeps the caret where a click put it when the browser moved it before focus', () => {
    const activeEditor = mount()
    putBrowserCaretAtEndOf(activeEditor, 'second')
    setMouseDown(activeEditor, {})
    activeEditor.view.dom.focus()
    setMouseDown(activeEditor, null)
    expect(activeEditor.state.selection.$from.parent.textContent).toBe('second')
    expect(activeEditor.state.selection.$from.parentOffset).toBe('second'.length)
  })

  it('keeps its own caret when focused without a click', () => {
    const activeEditor = mount()
    putBrowserCaretAtEndOf(activeEditor, 'second')
    activeEditor.view.dom.focus()
    expect(activeEditor.state.selection.from).toBe(1)
  })
})
