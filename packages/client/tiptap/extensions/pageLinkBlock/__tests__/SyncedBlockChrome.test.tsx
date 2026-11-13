import '../../__tests__/installHappyDom'
import type {HocuspocusProvider} from '@hocuspocus/provider'
import {Editor} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {PageLinkBlockBase} from '../../../../shared/tiptap/extensions/PageLinkBlockBase'
import {syncedBlockPlaceholderText} from '../../../pagePlaceholderText'
import {SyncedBlockBar} from '../SyncedBlockBar'
import {SyncedBlockCaption} from '../SyncedBlockCaption'
import {type SyncedBlockChrome, SyncedBlockEditor} from '../SyncedBlockEditor'
import {useSyncedBlockName} from '../useSyncedBlockName'
import {findLinkPositions, mountNested, syncedLink} from './syncedBlockTestHarness'

let mockNestedEditor: Editor | null = null
jest.mock('../../../../hooks/useTipTapPageEditor', () => ({
  useTipTapPageEditor: () => ({editor: mockNestedEditor})
}))
jest.mock('../../../../components/TipTapEditor/TipTapEditor', () => ({
  TipTapEditor: () => null
}))

type Listener = (payload: {scope: string}) => void
class FakeProvider {
  authorizedScope: string
  listeners = new Set<Listener>()
  constructor(scope: string) {
    this.authorizedScope = scope
  }
  on(_eventName: string, listener: Listener) {
    this.listeners.add(listener)
  }
  off(_eventName: string, listener: Listener) {
    this.listeners.delete(listener)
  }
  authenticate(scope: string) {
    this.authorizedScope = scope
    this.listeners.forEach((listener) => listener({scope}))
  }
}

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
  mockNestedEditor = null
})

const text = () => container.textContent ?? ''
const copyButton = () =>
  Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent?.includes('Copy and sync')
  )

const mountHost = () =>
  new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit, PageLinkBlockBase.extend({addStorage: () => ({})})],
    content: {type: 'doc', content: [{type: 'paragraph'}, syncedLink]}
  })

const mountBlock = (scope = 'read-write') => {
  const host = mountHost()
  const linkPos = findLinkPositions(host)[0]!
  const nested = mountNested(host, linkPos, ['Sev 1: page the on-call lead.'])
  mockNestedEditor = nested
  const provider = new FakeProvider(scope)
  const reports: (SyncedBlockChrome | null)[] = []
  act(() =>
    root.render(
      <SyncedBlockEditor
        provider={provider as unknown as HocuspocusProvider}
        pageId='page:7'
        hostEditor={host}
        getPos={() => linkPos}
        getSize={() => host.state.doc.nodeAt(linkPos)!.nodeSize}
        onChromeChange={(chrome) => reports.push(chrome)}
      />
    )
  )
  return {host, nested, provider, reports}
}

test('the caption names the block, falling back to Synced block', () => {
  act(() => root.render(<SyncedBlockCaption name='Escalation path' />))
  expect(text()).toBe('Escalation path')
  act(() => root.render(<SyncedBlockCaption name='' />))
  expect(text()).toBe('Synced block')
})

test('the bar shows Original only on the original', () => {
  const onCopy = jest.fn()
  act(() =>
    root.render(
      <SyncedBlockBar name='Escalation path' isOriginal isViewOnly={false} onCopy={onCopy} />
    )
  )
  expect(text()).toContain('Escalation path')
  expect(text()).toContain('Original')
  expect(text()).not.toContain('View only')
  act(() => {
    copyButton()!.click()
  })
  expect(onCopy).toHaveBeenCalledTimes(1)
  act(() =>
    root.render(<SyncedBlockBar name='' isOriginal={false} isViewOnly={false} onCopy={onCopy} />)
  )
  expect(text()).toContain('Synced block')
  expect(text()).not.toContain('Original')
})

test('a read-only block shows a View only bar that keeps Copy and sync', () => {
  const onCopy = jest.fn()
  act(() =>
    root.render(<SyncedBlockBar name='Escalation path' isOriginal isViewOnly onCopy={onCopy} />)
  )
  expect(text()).toContain('View only')
  expect(text()).not.toContain('Original')
  act(() => {
    copyButton()!.click()
  })
  expect(onCopy).toHaveBeenCalledTimes(1)
})

test('a view-only host makes the block read-only', () => {
  const {host, nested, reports} = mountBlock()
  expect(nested.isEditable).toBe(true)
  expect(reports.at(-1)).toEqual({editor: nested, isViewOnly: false})
  act(() => {
    host.setEditable(false)
  })
  expect(nested.isEditable).toBe(false)
  expect(reports.at(-1)).toEqual({editor: nested, isViewOnly: true})
  act(() => {
    host.setEditable(true)
  })
  expect(nested.isEditable).toBe(true)
})

test('a readonly block scope makes the block read-only', () => {
  const {nested, provider, reports} = mountBlock()
  act(() => provider.authenticate('readonly'))
  expect(nested.isEditable).toBe(false)
  expect(reports.at(-1)).toEqual({editor: nested, isViewOnly: true})
  act(() => root.unmount())
  expect(reports.at(-1)).toBeNull()
  root = createRoot(container)
})

test('a block that starts readonly is read-only from the first render', () => {
  const {nested} = mountBlock('readonly')
  expect(nested.isEditable).toBe(false)
})

const NameProbe = ({editor}: {editor: Editor | null}) => <span>{useSyncedBlockName(editor)}</span>

test('useSyncedBlockName follows edits to the first heading', () => {
  act(() => root.render(<NameProbe editor={null} />))
  expect(text()).toBe('')
  const host = mountHost()
  const nested = mountNested(host, findLinkPositions(host)[0]!, ['Sev 1'])
  act(() => root.render(<NameProbe editor={nested} />))
  expect(text()).toBe('Escalation path')
  act(() => {
    nested.commands.insertContentAt(nested.state.doc.firstChild!.nodeSize - 1, ' v2')
  })
  expect(text()).toBe('Escalation path v2')
  act(() => {
    nested.commands.insertContentAt(nested.state.doc.content.size, {
      type: 'heading',
      attrs: {level: 1},
      content: [{type: 'text', text: 'Later heading'}]
    })
  })
  expect(text()).toBe('Escalation path v2')
})

test('an empty block asks for content and the hidden heading never shows a placeholder', () => {
  const host = mountHost()
  const nested = mountNested(host, findLinkPositions(host)[0]!, ['', ''])
  const {doc} = nested.state
  const heading = doc.firstChild!
  const firstParagraphPos = heading.nodeSize
  const secondParagraphPos = firstParagraphPos + doc.child(1).nodeSize
  expect(syncedBlockPlaceholderText({editor: nested, node: heading, pos: 0})).toBe('')
  expect(
    syncedBlockPlaceholderText({editor: nested, node: doc.child(1), pos: firstParagraphPos})
  ).toBe('Type here. It stays in sync wherever you paste it.')
  expect(
    syncedBlockPlaceholderText({editor: nested, node: doc.child(2), pos: secondParagraphPos})
  ).toBe("Press '/' for commands")
})
