import '../../../tiptap/extensions/__tests__/installHappyDom'
import {act, createElement} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {printPage} from '../../../tiptap/extensions/pageLinkBlock/syncedBlockPrint'
import {usePrintShortcut} from '../usePrintShortcut'

jest.mock('../../../tiptap/extensions/pageLinkBlock/syncedBlockPrint', () => ({
  printPage: jest.fn()
}))
jest.mock('../../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({})
}))

const Probe = () => {
  usePrintShortcut()
  return null
}

describe('usePrintShortcut', () => {
  let root: Root
  beforeEach(() => {
    root = createRoot(document.createElement('div'))
    jest.mocked(printPage).mockClear()
    act(() => root.render(createElement(Probe)))
  })
  afterEach(() => {
    act(() => root.unmount())
  })

  const press = (init: KeyboardEventInit) => {
    const event = new KeyboardEvent('keydown', {cancelable: true, ...init})
    window.dispatchEvent(event)
    return event
  }

  test('⌘P prints through the page', () => {
    const event = press({key: 'p', metaKey: true})
    expect(event.defaultPrevented).toBe(true)
    expect(printPage).toHaveBeenCalledTimes(1)
  })

  test('Ctrl+P prints through the page', () => {
    const event = press({key: 'p', ctrlKey: true})
    expect(event.defaultPrevented).toBe(true)
    expect(printPage).toHaveBeenCalledTimes(1)
  })

  test('⌘⇧P is left to Move to', () => {
    const event = press({key: 'P', metaKey: true, shiftKey: true})
    expect(event.defaultPrevented).toBe(false)
    expect(printPage).not.toHaveBeenCalled()
  })

  test('⌘⌥P is ignored', () => {
    const event = press({key: 'p', metaKey: true, altKey: true})
    expect(event.defaultPrevented).toBe(false)
    expect(printPage).not.toHaveBeenCalled()
  })

  test('a held key is swallowed without printing again', () => {
    const event = press({key: 'p', metaKey: true, repeat: true})
    expect(event.defaultPrevented).toBe(true)
    expect(printPage).not.toHaveBeenCalled()
  })
})
