import '../../__tests__/installHappyDom'
import {Editor} from '@tiptap/core'
import type {NodeViewProps} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {PageLinkBlockBase} from '../../../../shared/tiptap/extensions/PageLinkBlockBase'
import {SyncedBlockView} from '../SyncedBlockView'
import {findLinkPositions, mountNested, syncedLink} from './syncedBlockTestHarness'

jest.mock('../../../../components/ErrorComponent/ErrorComponent', () => ({
  __esModule: true,
  default: () => null
}))
let mockNestedEditor: Editor | null = null
let mockQueryReady = true
jest.mock('../../../../hooks/useAtmosphere', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../../../hooks/useQueryLoaderNow', () => ({
  __esModule: true,
  default: () => {
    const {useEffect, useState} = jest.requireActual<typeof import('react')>('react')
    const [isLoaded, setIsLoaded] = useState(false)
    useEffect(() => {
      if (mockQueryReady) setIsLoaded(true)
    }, [])
    return isLoaded ? {} : null
  }
}))
jest.mock('../useSyncedBlockPlaces', () => ({
  useSyncedBlockPlaces: () => ({label: 'Also on 2 pages'})
}))
jest.mock('../useMountNearViewport', () => ({useMountNearViewport: () => true}))
jest.mock('../SyncedBlockContent', () => ({
  SyncedBlockContent: ({onChromeChange}: {onChromeChange: (chrome: unknown) => void}) => {
    const {useEffect} = jest.requireActual<typeof import('react')>('react')
    useEffect(() => {
      onChromeChange({editor: mockNestedEditor, isViewOnly: false})
    }, [onChromeChange])
    return null
  }
}))

let root: Root
let container: HTMLElement

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  mockQueryReady = true
})

const flushTimers = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)))
const placesButton = () =>
  Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent?.startsWith('Also on')
  )

test('the bar shows the last places label at once when it comes back', async () => {
  const host = new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit, PageLinkBlockBase.extend({addStorage: () => ({pageId: 'page:1'})})],
    content: {type: 'doc', content: [{type: 'paragraph'}, syncedLink]}
  })
  const linkPos = findLinkPositions(host)[0]!
  mockNestedEditor = mountNested(host, linkPos, ['Sev 1'])
  const props = {
    node: host.state.doc.nodeAt(linkPos)!,
    editor: host,
    getPos: () => linkPos
  } as unknown as NodeViewProps
  act(() => root.render(<SyncedBlockView {...props} />))
  const wrapper = container.querySelector<HTMLElement>('[data-synced-block]')!
  act(() => wrapper.focus())
  expect(placesButton()?.textContent).toBe('Also on 2 pages')
  const outside = document.body.appendChild(document.createElement('button'))
  act(() => outside.focus())
  await flushTimers()
  expect(placesButton()).toBeUndefined()
  mockQueryReady = false
  act(() => wrapper.focus())
  expect(placesButton()?.textContent).toBe('Also on 2 pages')
  outside.remove()
})
