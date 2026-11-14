import './installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {serverTipTapExtensions} from '../../../shared/tiptap/serverTipTapExtensions'
import {createBlockSelection, getSelectedBlockRange} from '../../blockSelection/blockSelectionState'
import {countBlocks} from '../../blockSelection/blockUnits'
import DragHandleMenu from '../DragHandleMenu'
import {happyWindow} from './installHappyDom'

const p = (text: string): JSONContent => ({type: 'paragraph', content: [{type: 'text', text}]})
const h = (level: number, text: string): JSONContent => ({
  type: 'heading',
  attrs: {level},
  content: [{type: 'text', text}]
})
const callout = (text: string): JSONContent => ({
  type: 'callout',
  attrs: {tone: 'info'},
  content: [p(text)]
})

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

const openMenuOnSelection = async (blocks: JSONContent[], first: number, last: number) => {
  const activeEditor = new Editor({
    element: document.body.appendChild(document.createElement('div')),
    extensions,
    content: {type: 'doc', content: [h(1, 'Title'), ...blocks]}
  })
  editor = activeEditor
  const {doc} = activeEditor.state
  const childStart = (index: number) => {
    let pos = 0
    for (let i = 0; i < index; i++) pos += doc.child(i).nodeSize
    return pos
  }
  const range = {from: childStart(first), to: childStart(last + 1), depth: 0}
  activeEditor.view.dispatch(activeEditor.state.tr.setSelection(createBlockSelection(doc, range)))
  const pos = range.from
  const node = doc.nodeAt(pos)!
  const host = document.body.appendChild(document.createElement('div'))
  const anchor = document.body.appendChild(document.createElement('div'))
  const onClose = jest.fn()
  await act(async () => {
    root = createRoot(host)
    root.render(
      <DragHandleMenu
        editor={activeEditor}
        node={node}
        pos={pos}
        onClose={onClose}
        anchorElement={anchor}
        canCreateSubPage
        selection={{range, count: countBlocks(doc, range)}}
      />
    )
    await tick()
  })
  return {activeEditor, onClose}
}

const items = () => Array.from(document.querySelectorAll<HTMLElement>('[role^="menuitem"]'))
const itemNamed = (name: string) => {
  const item = items().find((element) => element.textContent?.startsWith(name))
  if (!item) throw new Error(`No item named ${name}`)
  return item
}
const header = () =>
  document.querySelector('[data-radix-menu-content] > div:not([role])')?.textContent ?? null
const click = async (element: HTMLElement) => {
  await act(async () => {
    element.click()
    await tick()
  })
}
const pressKey = async (element: HTMLElement, key: string, modifiers = {}) => {
  const event = new happyWindow.KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...modifiers
  })
  await act(async () => {
    element.dispatchEvent(event as unknown as Event)
    await tick()
  })
}
const texts = () => {
  const all: string[] = []
  editor?.state.doc.forEach((node, offset) => {
    if (offset > 0 && node.textContent) all.push(node.textContent)
  })
  return all
}

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

describe('the menu on a block selection', () => {
  test('counts the blocks and offers only Duplicate and Delete', async () => {
    await openMenuOnSelection([callout('one'), p('two'), p('three'), p('four')], 1, 3)
    expect(header()).toBe('3 blocks')
    expect(items().map((item) => item.textContent?.replace(/\s.*$/, ''))).toEqual([
      'Duplicate',
      'Delete'
    ])
    expect(itemNamed('Duplicate blocks')).toBeTruthy()
    expect(itemNamed('Delete blocks')).toBeTruthy()
  })

  test('Delete blocks removes every selected block', async () => {
    const {onClose} = await openMenuOnSelection([p('one'), p('two'), p('three'), p('four')], 1, 3)
    await click(itemNamed('Delete blocks'))
    expect(texts()).toEqual(['four'])
    expect(onClose).toHaveBeenCalled()
  })

  test('Duplicate blocks copies the run below and selects the copy', async () => {
    await openMenuOnSelection([p('one'), p('two'), p('three')], 1, 2)
    await click(itemNamed('Duplicate blocks'))
    expect(texts()).toEqual(['one', 'two', 'one', 'two', 'three'])
    const {doc} = editor!.state
    const copy = getSelectedBlockRange(editor!.state)!
    const originalEnd = doc.child(0).nodeSize + doc.child(1).nodeSize + doc.child(2).nodeSize
    expect(copy.from).toBe(originalEnd)
    expect(doc.textBetween(copy.from, copy.to, '|')).toBe('one|two')
  })

  test('the Delete key deletes the selection', async () => {
    await openMenuOnSelection([p('one'), p('two'), p('three')], 1, 2)
    await pressKey(itemNamed('Duplicate blocks'), 'Delete')
    expect(texts()).toEqual(['three'])
  })

  test('mod-D duplicates the selection', async () => {
    await openMenuOnSelection([p('one'), p('two')], 1, 2)
    await pressKey(itemNamed('Duplicate blocks'), 'd', {metaKey: true})
    expect(texts()).toEqual(['one', 'two', 'one', 'two'])
  })
})
