import './installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import {Document} from '@tiptap/extension-document'
import {NodeSelection} from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {PageLinkBlockBase} from '../../../shared/tiptap/extensions/PageLinkBlockBase'
import {serverTipTapExtensions} from '../../../shared/tiptap/serverTipTapExtensions'
import {createBlockSelection, getSelectedBlockRange} from '../../blockSelection/blockSelectionState'
import {countBlocks} from '../../blockSelection/blockUnits'
import DragHandleMenu from '../DragHandleMenu'
import {
  findLinkPositions,
  mountNested,
  syncedLink
} from '../pageLinkBlock/__tests__/syncedBlockTestHarness'
import {SYNCED_BLOCK_RENAME_EVENT} from '../pageLinkBlock/startSyncedBlockRename'
import {happyWindow} from './installHappyDom'

jest.mock('../../../components/ErrorComponent/ErrorComponent', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('../../../hooks/useQueryLoaderNow', () => ({__esModule: true, default: () => null}))
jest.mock('../../../hooks/useAtmosphere', () => ({__esModule: true, default: () => ({})}))
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => jest.fn()
}))

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

describe('the menu on a synced block', () => {
  const openSyncedMenu = async ({isViewOnly = false, isMounted = true} = {}) => {
    const host = new Editor({
      element: document.body.appendChild(document.createElement('div')),
      extensions: [StarterKit, PageLinkBlockBase.extend({addStorage: () => ({pageId: 'page:1'})})],
      content: {type: 'doc', content: [p('Above'), syncedLink, p('Below')]}
    })
    editor = host
    const pos = findLinkPositions(host)[0]!
    const nested = isMounted ? mountNested(host, pos, ['Sev 1: page the on-call lead.']) : null
    if (isViewOnly) nested?.setEditable(false)
    const anchor = document.body.appendChild(document.createElement('div'))
    const container = document.body.appendChild(document.createElement('div'))
    const onClose = jest.fn(() => root?.render(null))
    await act(async () => {
      root = createRoot(container)
      root.render(
        <DragHandleMenu
          editor={host}
          node={host.state.doc.nodeAt(pos)!}
          pos={pos}
          onClose={onClose}
          anchorElement={anchor}
          canCreateSubPage
          selection={null}
        />
      )
      await tick()
    })
    return {host, nested, pos, onClose}
  }
  const hostBlocks = (host: Editor) => {
    const all: string[] = []
    host.state.doc.forEach((node) => {
      all.push(node.type.name === 'paragraph' ? node.textContent : node.type.name)
    })
    return all
  }

  test('a synced block gets the synced menu without Turn into', async () => {
    await openSyncedMenu()
    expect(items()).toHaveLength(4)
    expect(itemNamed('Copy and sync')).toBeTruthy()
    expect(itemNamed('Rename')).toBeTruthy()
    expect(itemNamed('Duplicate as plain blocks')).toBeTruthy()
    expect(itemNamed('Delete from this page')).toBeTruthy()
    expect(items().some((item) => item.textContent?.startsWith('Turn into'))).toBe(false)
  })

  test('Mod+D in the synced menu duplicates as plain blocks', async () => {
    const {host, onClose} = await openSyncedMenu()
    await pressKey(itemNamed('Copy and sync'), 'd', {metaKey: true})
    await act(tick)
    expect(hostBlocks(host)).toEqual([
      'Above',
      'pageLinkBlock',
      'Sev 1: page the on-call lead.',
      'Below'
    ])
    expect(findLinkPositions(host)).toHaveLength(1)
    expect(onClose).toHaveBeenCalled()
  })

  test('Delete in the synced menu removes the block from this page', async () => {
    const {host} = await openSyncedMenu()
    await pressKey(itemNamed('Copy and sync'), 'Delete')
    await act(tick)
    expect(hostBlocks(host)).toEqual(['Above', 'Below'])
  })

  test('a view-only block offers only Copy and sync and ignores the shortcuts', async () => {
    const {host} = await openSyncedMenu({isViewOnly: true})
    expect(items().map((item) => item.textContent)).toEqual(['Copy and sync'])
    await pressKey(itemNamed('Copy and sync'), 'Delete')
    await pressKey(itemNamed('Copy and sync'), 'd', {metaKey: true})
    expect(hostBlocks(host)).toEqual(['Above', 'pageLinkBlock', 'Below'])
  })

  test('a block that is not mounted still offers Delete from this page', async () => {
    const {host} = await openSyncedMenu({isMounted: false})
    expect(items().map((item) => item.textContent?.replace(/Del$/, ''))).toEqual([
      'Copy and sync',
      'Delete from this page'
    ])
    await pressKey(itemNamed('Copy and sync'), 'd', {metaKey: true})
    expect(hostBlocks(host)).toEqual(['Above', 'pageLinkBlock', 'Below'])
    await click(itemNamed('Delete from this page'))
    await act(tick)
    expect(hostBlocks(host)).toEqual(['Above', 'Below'])
  })

  test('Delete in the menu of a block that is not mounted removes it', async () => {
    const {host} = await openSyncedMenu({isMounted: false})
    await pressKey(itemNamed('Copy and sync'), 'Backspace')
    await act(tick)
    expect(hostBlocks(host)).toEqual(['Above', 'Below'])
  })

  const insertAt = (host: Editor, pos: number, content: JSONContent) =>
    act(() => {
      host.view.dispatch(host.state.tr.insert(pos, host.schema.nodeFromJSON(content)))
    })

  test('Delete finds the block after someone edits above it while the menu is open', async () => {
    const {host} = await openSyncedMenu()
    insertAt(host, 0, p('New'))
    await click(itemNamed('Delete from this page'))
    await act(tick)
    expect(hostBlocks(host)).toEqual(['New', 'Above', 'Below'])
  })

  test('Duplicate copies the block the menu opened on, not one that took its place', async () => {
    const {host, pos} = await openSyncedMenu()
    insertAt(host, pos, {...syncedLink, attrs: {...syncedLink.attrs, pageCode: 9}})
    await click(itemNamed('Duplicate as plain blocks'))
    await act(tick)
    expect(hostBlocks(host)).toEqual([
      'Above',
      'pageLinkBlock',
      'pageLinkBlock',
      'Sev 1: page the on-call lead.',
      'Below'
    ])
  })

  test('Rename selects the block after someone edits above it', async () => {
    const {host} = await openSyncedMenu()
    insertAt(host, 0, p('New'))
    const movedPos = findLinkPositions(host)[0]!
    await click(itemNamed('Rename'))
    await act(tick)
    const {selection} = host.state
    expect(selection instanceof NodeSelection && selection.from === movedPos).toBe(true)
  })

  test('Rename does nothing once the block is gone', async () => {
    const {host, pos} = await openSyncedMenu()
    act(() => {
      host.view.dispatch(host.state.tr.delete(pos, pos + host.state.doc.nodeAt(pos)!.nodeSize))
    })
    await click(itemNamed('Rename'))
    await act(tick)
    expect(host.state.selection instanceof NodeSelection).toBe(false)
  })

  test('Rename starts only once the menu has closed', async () => {
    const {host, pos} = await openSyncedMenu()
    const menuOpenAtRename: boolean[] = []
    host.view.nodeDOM(pos)!.addEventListener(SYNCED_BLOCK_RENAME_EVENT, () => {
      menuOpenAtRename.push(!!document.querySelector('[role="menu"]'))
    })
    await click(itemNamed('Rename'))
    await act(tick)
    expect(menuOpenAtRename).toEqual([false])
    const {selection} = host.state
    expect(selection instanceof NodeSelection && selection.from === pos).toBe(true)
  })
})
