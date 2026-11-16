import '../../__tests__/installHappyDom'
import type {HocuspocusProvider} from '@hocuspocus/provider'
import {type Editor, Extension} from '@tiptap/core'
import {NodeSelection} from '@tiptap/pm/state'
import type * as Y from 'yjs'
import type Atmosphere from '../../../../Atmosphere'
import {h, p, read, seed} from '../../../blockMove/__tests__/blockMoveTestHelpers'
import {endBlockDrag, startBlockDrag} from '../../../blockMove/blockDragSession'
import {getMovableBlocks, type MovableBlocks} from '../../../blockMove/getMovableBlocks'
import {moveDroppedBlocks} from '../../../blockMove/moveDroppedBlocks'
import {trackRange} from '../../../blockMove/trackRange'
import {providerManager} from '../../../providerManager'
import {happyWindow} from '../../__tests__/installHappyDom'
import {SyncedBlockDrops} from '../syncedBlockDrops'
import {findLinkPositions, mountHost, mountNested, syncedLink} from './syncedBlockTestHarness'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../../blockMove/undoBlockMove', () => ({undoBlockMove: jest.fn()}))
jest.mock('../../../providerManager', () => ({
  providerManager: {openSynced: jest.fn(), unregister: jest.fn()}
}))

Object.defineProperty(globalThis, 'DragEvent', {value: happyWindow.DragEvent, configurable: true})

const emit = jest.fn()
const atmosphere = {commitUpdate: jest.fn(), eventEmitter: {emit}} as unknown as Atmosphere
const moveHistory = Extension.create({name: 'blockMoveHistory', addStorage: () => ({atmosphere})})
const openSynced = jest.mocked(providerManager.openSynced)
let blockFrag: Y.XmlFragment
let hostFrag: Y.XmlFragment

const drops = (pageId: string, isNested: boolean) =>
  SyncedBlockDrops.configure({pageId, isNested, onBlockDrop: moveDroppedBlocks})

const setup = () => {
  const host = mountHost(
    [p('Para to drag'), p('Next'), syncedLink, p('Tail')],
    [moveHistory, drops('page:1', false)]
  )
  document.body.appendChild(host.view.dom.parentElement!)
  const [linkPos] = findLinkPositions(host)
  const nested = mountNested(host, linkPos!, ['Block line'], [moveHistory, drops('page:7', true)])
  return {host, nested, blockLine: nested.view.dom.querySelector('p')!}
}

const fire = (target: Element, type: string) => {
  const event = new DragEvent(type, {bubbles: true, cancelable: true})
  target.dispatchEvent(event)
  return event
}

const dragFirstHostBlockWithNextSelected = (
  host: Editor,
  movable: Partial<MovableBlocks> | null
) => {
  const {doc} = host.state
  const to = doc.child(0).nodeSize
  host.view.dispatch(host.state.tr.setSelection(NodeSelection.create(doc, to)))
  if (movable) {
    const session = {
      editor: host,
      range: trackRange(host, 0, to),
      sourcePageId: 'page:1',
      movable: {...getMovableBlocks(doc, 0, to), ...movable},
      count: 1
    }
    startBlockDrag(atmosphere, session, null)
  }
  fire(host.view.dom.querySelector('p')!, 'dragstart')
}

const afterTiptapTimers = () => new Promise((resolve) => setTimeout(resolve, 50))

const hostTexts = (host: Editor) => {
  const texts: string[] = []
  host.state.doc.forEach((node) => {
    texts.push(node.textContent)
  })
  return texts
}

const providerFor = (frag: Y.XmlFragment) =>
  ({
    authorizedScope: 'read-write',
    document: frag.doc!,
    hasUnsyncedChanges: false,
    on() {},
    off() {}
  }) as unknown as HocuspocusProvider

beforeEach(() => {
  blockFrag = seed(h(1, 'Escalation path'), p('Block line'))
  hostFrag = seed(h(1, 'Runbook'), p('Host line'))
  openSynced.mockImplementation(
    (documentName) =>
      new Promise((resolve) => {
        setTimeout(() => resolve(providerFor(documentName === 'page:1' ? hostFrag : blockFrag)), 20)
      })
  )
})

afterEach(() => {
  endBlockDrag(atmosphere)
  openSynced.mockReset()
  document.body.replaceChildren()
})

describe('drops onto a synced block', () => {
  test('a host block dropped on the block moves where it was dropped, and only the move touches the host', async () => {
    const {host, nested, blockLine} = setup()
    const blockBefore = nested.getJSON()
    dragFirstHostBlockWithNextSelected(host, {})
    const dragover = fire(blockLine, 'dragover')
    const lineStart = nested.state.doc.child(0).nodeSize + 1
    jest.spyOn(nested.view, 'posAtCoords').mockReturnValue({pos: lineStart, inside: -1})
    const drop = fire(blockLine, 'drop')
    await afterTiptapTimers()
    expect(dragover.defaultPrevented).toBe(true)
    expect(drop.defaultPrevented).toBe(true)
    expect(hostTexts(host)).toEqual(['Next', '', 'Tail'])
    expect(read(blockFrag)).toEqual([h(1, 'Escalation path'), p('Para to drag'), p('Block line')])
    expect(nested.getJSON()).toEqual(blockBefore)
    expect(openSynced).toHaveBeenCalledWith('page:7', expect.any(Number))
    const snack = emit.mock.calls.find(([event]) => event === 'addSnackbar')?.[1]
    expect(snack).toMatchObject({
      message: 'Moved 1 block to Escalation path',
      secondaryAction: {label: 'Undo'}
    })
    expect(snack).not.toHaveProperty('action')
  })

  test.each([
    ['a drag that is not a block move', null, false],
    ['a drag carrying a child page', {childPages: [{pageCode: 9, title: 'Specs'}]}, false],
    ['the block dropped into itself', {blocks: [syncedLink]}, false],
    ['a block drag onto a view-only block', {}, true]
  ])('%s changes nothing and draws no drop line', async (_label, movable, isViewOnly) => {
    const {host, nested, blockLine} = setup()
    if (isViewOnly) nested.setEditable(false)
    const hostBefore = host.getJSON()
    const blockBefore = nested.getJSON()
    dragFirstHostBlockWithNextSelected(host, movable)
    const dragover = fire(blockLine, 'dragover')
    const drop = fire(blockLine, 'drop')
    await afterTiptapTimers()
    expect(dragover.defaultPrevented).toBe(false)
    expect(drop.defaultPrevented).toBe(true)
    expect(host.getJSON()).toEqual(hostBefore)
    expect(nested.getJSON()).toEqual(blockBefore)
    expect(openSynced).not.toHaveBeenCalled()
  })

  test('a drag that starts inside the block reaches its editor', () => {
    const {nested, blockLine} = setup()
    const reachedEditor = jest.fn()
    nested.view.dom.addEventListener('drop', reachedEditor)
    const handle = nested.view.dom.parentElement!
    fire(handle, 'dragstart')
    fire(blockLine, 'drop')
    fire(handle, 'dragend')
    expect(reachedEditor).toHaveBeenCalledTimes(1)
  })

  test('a file dragged in from outside the page reaches the block editor', () => {
    const {nested, blockLine} = setup()
    const reachedEditor = jest.fn()
    nested.view.dom.addEventListener('drop', reachedEditor)
    fire(blockLine, 'drop')
    expect(reachedEditor).toHaveBeenCalledTimes(1)
  })
})

describe('drops out of a synced block onto its page', () => {
  const dragBlockLine = (nested: Editor) => {
    const {doc} = nested.state
    const from = doc.child(0).nodeSize
    const to = from + doc.child(1).nodeSize
    const session = {
      editor: nested,
      range: trackRange(nested, from, to),
      sourcePageId: 'page:7',
      movable: getMovableBlocks(doc, from, to),
      count: 1
    }
    startBlockDrag(atmosphere, session, null)
    fire(nested.view.dom.querySelector('p')!, 'dragstart')
  }

  test('a block dragged out of the block moves onto the page', async () => {
    const {host, nested} = setup()
    dragBlockLine(nested)
    const tail = [...host.view.dom.querySelectorAll('p')].find((el) => el.textContent === 'Tail')!
    const dragover = fire(tail, 'dragover')
    const drop = fire(tail, 'drop')
    await afterTiptapTimers()
    expect(dragover.defaultPrevented).toBe(true)
    expect(drop.defaultPrevented).toBe(true)
    expect(read(hostFrag)).toEqual([h(1, 'Runbook'), p('Host line'), p('Block line')])
    expect(nested.getText()).not.toContain('Block line')
    expect(openSynced).toHaveBeenCalledWith('page:1', expect.any(Number))
    const snack = emit.mock.calls.find(([event]) => event === 'addSnackbar')?.[1]
    expect(snack).toMatchObject({secondaryAction: {label: 'Undo'}})
  })

  test('a drag out of the block that is not a block move is left to the page', () => {
    const {host, nested} = setup()
    const reachedPage = jest.fn()
    host.view.dom.addEventListener('drop', reachedPage)
    fire(nested.view.dom.querySelector('p')!, 'dragstart')
    fire(host.view.dom.querySelector('p')!, 'drop')
    expect(reachedPage).toHaveBeenCalledTimes(1)
    expect(openSynced).not.toHaveBeenCalled()
  })
})
