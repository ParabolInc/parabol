import '../../../tiptap/extensions/__tests__/installHappyDom'
import {Editor} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {TextSelection} from '@tiptap/pm/state'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {serverTipTapExtensions} from '../../../shared/tiptap/serverTipTapExtensions'
import {happyWindow} from '../../../tiptap/extensions/__tests__/installHappyDom'
import {BubbleTurnIntoMenu} from '../BubbleTurnIntoMenu'

type Json = Record<string, unknown>
const p = (text: string): Json => ({type: 'paragraph', content: [{type: 'text', text}]})
const TITLE: Json = {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: 'Title'}]}
const TITLE_SIZE = 7

const extensions = [
  Document.extend({content: 'heading block*'}),
  ...serverTipTapExtensions.map((extension) =>
    extension.name === 'starterKit'
      ? extension.configure({document: false, trailingNode: {node: 'paragraph'}})
      : extension
  )
]

const tick = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms))

let root: Root | undefined
let editor: Editor | undefined

const renderMenu = async (blocks: Json[], from: number, to: number) => {
  const activeEditor = new Editor({
    element: document.body.appendChild(document.createElement('div')),
    extensions,
    content: {type: 'doc', content: [TITLE, ...blocks]}
  })
  editor = activeEditor
  const {state} = activeEditor
  activeEditor.view.dispatch(state.tr.setSelection(TextSelection.create(state.doc, from, to)))
  await act(async () => {
    root = createRoot(document.body.appendChild(document.createElement('div')))
    root.render(<BubbleTurnIntoMenu editor={activeEditor} canCreateSubPage />)
    await tick()
  })
  return activeEditor
}

const trigger = () => document.querySelector<HTMLElement>('button[title="Turn into"]')
const rows = () => Array.from(document.querySelectorAll<HTMLElement>('[role="menuitemradio"]'))
const rowNamed = (name: string) => rows().find((row) => row.textContent === name)!
const openMenu = () =>
  act(async () => {
    trigger()!.dispatchEvent(
      new happyWindow.PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        button: 0,
        pointerType: 'mouse'
      }) as unknown as Event
    )
    await tick()
  })

afterEach(async () => {
  await act(async () => {
    root?.unmount()
    root = undefined
    await tick()
  })
  editor?.destroy()
  editor = undefined
  document.body.replaceChildren()
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

test('names the selected block and checks it in the list', async () => {
  await renderMenu([p('word')], TITLE_SIZE + 1, TITLE_SIZE + 5)
  expect(trigger()?.textContent).toBe('Text')
  await openMenu()
  expect(rows()).toHaveLength(12)
  expect(rows().filter((row) => row.getAttribute('aria-checked') === 'true')).toEqual([
    rowNamed('Text')
  ])
})

test('hides the Callout row inside a callout', async () => {
  const callout = {type: 'callout', attrs: {tone: 'plain'}, content: [p('word')]}
  await renderMenu([callout], TITLE_SIZE + 2, TITLE_SIZE + 6)
  await openMenu()
  expect(rows().map((row) => row.textContent)).not.toContain('Callout')
})

test.each([
  ['spans two blocks', [p('one'), p('two')], TITLE_SIZE + 1, TITLE_SIZE + 9],
  ['is in the page title', [p('word')], 1, 6]
])('is missing when the selection %s', async (_name, blocks, from, to) => {
  await renderMenu(blocks, from, to)
  expect(trigger()).toBeNull()
})

test('picking a row converts the block and puts the caret in it', async () => {
  const activeEditor = await renderMenu([p('word')], TITLE_SIZE + 1, TITLE_SIZE + 5)
  await openMenu()
  await act(async () => {
    rowNamed('Heading 2').click()
    await tick()
  })
  const block = activeEditor.state.doc.child(1)
  expect([block.type.name, block.attrs.level]).toEqual(['heading', 2])
  expect(activeEditor.state.selection.$from.parent).toBe(block)
  expect(activeEditor.view.hasFocus()).toBe(true)
})
