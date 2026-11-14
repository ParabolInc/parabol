import './installHappyDom'
import {Editor} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import StarterKit from '@tiptap/starter-kit'

const mountPageEditor = () =>
  new Editor({
    element: document.createElement('div'),
    extensions: [
      Document.extend({content: 'heading block*'}),
      StarterKit.configure({document: false, undoRedo: false})
    ],
    content: '<h1></h1>'
  })

describe('pasting into a page title', () => {
  it('keeps a list followed by loose text', () => {
    const editor = mountPageEditor()
    editor.commands.setTextSelection(1)
    editor.view.pasteHTML('<ul><li>a</li></ul>b')
    expect(() => editor.state.doc.check()).not.toThrow()
    expect(editor.state.doc.textContent).toBe('ab')
    editor.destroy()
  })
})
