import '../../__tests__/installHappyDom'
import {NodeSelection} from '@tiptap/pm/state'
import {happyWindow} from '../../__tests__/installHappyDom'
import {findLinkPositions, mountHost, mountNested, syncedLink} from './syncedBlockTestHarness'

Object.defineProperty(globalThis, 'DragEvent', {value: happyWindow.DragEvent, configurable: true})

const paragraph = (text: string) => ({type: 'paragraph', content: [{type: 'text', text}]})

const setup = () => {
  const host = mountHost([
    paragraph('Para to drag'),
    paragraph('Next'),
    syncedLink,
    paragraph('Tail')
  ])
  document.body.appendChild(host.view.dom.parentElement!)
  const [linkPos] = findLinkPositions(host)
  const nested = mountNested(host, linkPos!, ['Block line'])
  return {host, nested, blockLine: nested.view.dom.querySelector('p')!}
}

const fire = (target: Element, type: string) => {
  const event = new DragEvent(type, {bubbles: true, cancelable: true})
  target.dispatchEvent(event)
  return event
}

const afterTiptapTimers = () => new Promise((resolve) => setTimeout(resolve, 30))

describe('drops onto a synced block', () => {
  test('a host block dropped on a synced block stays in the host and nothing lands in it', async () => {
    const {host, nested, blockLine} = setup()
    host.view.dispatch(host.state.tr.setSelection(NodeSelection.create(host.state.doc, 0)))
    const hostBefore = host.getJSON()
    const blockBefore = nested.getJSON()
    const dragged = host.view.dom.querySelector('p')!
    fire(dragged, 'dragstart')
    const dragover = fire(blockLine, 'dragover')
    fire(blockLine, 'drop')
    await afterTiptapTimers()
    fire(dragged, 'dragend')
    expect(host.getJSON()).toEqual(hostBefore)
    expect(nested.getJSON()).toEqual(blockBefore)
    expect(dragover.defaultPrevented).toBe(false)
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
