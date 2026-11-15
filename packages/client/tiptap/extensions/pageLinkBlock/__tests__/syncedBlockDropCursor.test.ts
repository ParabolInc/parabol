import '../../__tests__/installHappyDom'
import {happyWindow} from '../../__tests__/installHappyDom'
import {refuseForeignDrops} from '../refuseForeignDrops'
import {
  clearDropCursorOverSyncedBlocks,
  disableDropCursorInSyncedBlock
} from '../syncedBlockDropCursor'
import {findLinkPositions, mountHost, mountNested, syncedLink} from './syncedBlockTestHarness'

Object.defineProperty(globalThis, 'DragEvent', {value: happyWindow.DragEvent, configurable: true})

const paragraph = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})

const setup = () => {
  const host = mountHost([paragraph('Host line'), syncedLink, paragraph('Tail')])
  host.registerPlugin(clearDropCursorOverSyncedBlocks())
  document.body.appendChild(host.view.dom.parentElement!)
  const [linkPos] = findLinkPositions(host)
  const nested = mountNested(host, linkPos!, ['Block line'])
  nested.view.dom.parentElement!.dataset.syncedEditor = ''
  const hostLeaves = jest.fn()
  host.view.dom.addEventListener('dragleave', (event) => hostLeaves(event.relatedTarget ?? null))
  return {
    host,
    nested,
    hostLeaves,
    hostLine: host.view.dom.querySelector('p')!,
    blockLine: nested.view.dom.querySelector('p')!
  }
}

const fire = (target: Element, type: string) => {
  const event = new DragEvent(type, {bubbles: true, cancelable: true})
  target.dispatchEvent(event)
  return event
}

describe("the page's drop line and synced blocks", () => {
  test('a drag over a line inside a block shows no drop line on the page', () => {
    const {host, blockLine} = setup()
    const event = new DragEvent('dragover', {bubbles: true})
    Object.defineProperty(event, 'target', {value: blockLine})
    expect(disableDropCursorInSyncedBlock(host.view, null, event)).toBe(true)
  })

  test('a drag over a page line keeps the drop line', () => {
    const {host, hostLine} = setup()
    const event = new DragEvent('dragover', {bubbles: true})
    Object.defineProperty(event, 'target', {value: hostLine})
    expect(disableDropCursorInSyncedBlock(host.view, null, event)).toBe(false)
  })

  test("entering a block clears the page's drop line", () => {
    const {hostLeaves, blockLine} = setup()
    fire(blockLine, 'dragenter')
    expect(hostLeaves).toHaveBeenCalledWith(null)
  })

  test("entering a block that refuses the drag still clears the page's drop line", () => {
    const {host, nested, hostLeaves, hostLine, blockLine} = setup()
    nested.registerPlugin(refuseForeignDrops())
    fire(hostLine, 'dragstart')
    fire(blockLine, 'dragenter')
    fire(hostLine, 'dragend')
    expect(hostLeaves).toHaveBeenCalledWith(null)
    expect(host.view.dom.contains(blockLine)).toBe(true)
  })

  test('moving between page lines leaves the drop line alone', () => {
    const {hostLeaves, hostLine} = setup()
    fire(hostLine, 'dragenter')
    expect(hostLeaves).not.toHaveBeenCalled()
  })
})
