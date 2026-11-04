import './installHappyDom'
import {Editor} from '@tiptap/core'
import {Details, DetailsContent, DetailsSummary} from '@tiptap/extension-details'
import StarterKit from '@tiptap/starter-kit'

const paragraph = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})

const openDetails = {
  type: 'details',
  attrs: {open: true},
  content: [
    {type: 'detailsSummary', content: [{type: 'text', text: 'summary'}]},
    {type: 'detailsContent', content: [paragraph('body')]}
  ]
}

const mountEditor = () =>
  new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit, Details.configure({persist: true}), DetailsSummary, DetailsContent],
    content: {type: 'doc', content: [openDetails]}
  })

const expectOnScreenOpen = (editor: Editor) => {
  const details = editor.view.dom.querySelector('[data-type="details"]')!
  expect(details.classList.contains('is-open')).toBe(true)
  expect(details.querySelector('[data-type="detailsContent"]')!.hasAttribute('hidden')).toBe(false)
}

const waitForNodeViewTimer = () => new Promise((resolve) => setTimeout(resolve))

describe('a Details created open', () => {
  it('shows open', async () => {
    const editor = mountEditor()
    await waitForNodeViewTimer()
    expectOnScreenOpen(editor)
    editor.destroy()
  })

  it('stays open when its node view updates before its first timer', async () => {
    const editor = mountEditor()
    editor.commands.insertContentAt(2, 'x')
    await waitForNodeViewTimer()
    expect(editor.getJSON().content?.[0]?.attrs?.open).toBe(true)
    expectOnScreenOpen(editor)
    editor.destroy()
  })
})
