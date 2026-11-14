import '../../__tests__/installHappyDom'
import type {HocuspocusProvider} from '@hocuspocus/provider'
import {Editor} from '@tiptap/core'
import type {NodeViewProps} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {PageLinkBlockBase} from '../../../../shared/tiptap/extensions/PageLinkBlockBase'
import {syncedBlockPlaceholderText} from '../../../pagePlaceholderText'
import {SyncedBlockBar} from '../SyncedBlockBar'
import {SyncedBlockCaption} from '../SyncedBlockCaption'
import {type SyncedBlockChrome, SyncedBlockEditor} from '../SyncedBlockEditor'
import {SyncedBlockView} from '../SyncedBlockView'
import {SYNCED_BLOCK_RENAME_EVENT} from '../startSyncedBlockRename'
import {useSyncedBlockName} from '../useSyncedBlockName'
import {findLinkPositions, mountNested, syncedLink} from './syncedBlockTestHarness'

let mockNestedEditor: Editor | null = null
const hostRef: {current: Editor | null} = {current: null}
jest.mock('../../../../hooks/useTipTapPageEditor', () => ({
  useTipTapPageEditor: () => ({editor: mockNestedEditor})
}))
jest.mock('../../../../components/TipTapEditor/TipTapEditor', () => ({
  TipTapEditor: () => null
}))
jest.mock('../../../../hooks/useAtmosphere', () => ({__esModule: true, default: () => ({})}))
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
jest.mock('../SyncedBlockPlacesRoot', () => ({
  SyncedBlockPlacesRoot: ({onOpenChange}: {onOpenChange: (open: boolean) => void}) => {
    const {Menu} = jest.requireActual<typeof import('../../../../ui/Menu/Menu')>(
      '../../../../ui/Menu/Menu'
    )
    const {MenuContent} = jest.requireActual<typeof import('../../../../ui/Menu/MenuContent')>(
      '../../../../ui/Menu/MenuContent'
    )
    const {MenuItem} = jest.requireActual<typeof import('../../../../ui/Menu/MenuItem')>(
      '../../../../ui/Menu/MenuItem'
    )
    return (
      <Menu onOpenChange={onOpenChange} trigger={<button type='button'>Also on 1 page</button>}>
        <MenuContent>
          <MenuItem>Runbook</MenuItem>
        </MenuContent>
      </Menu>
    )
  }
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
      <SyncedBlockBar
        name='Escalation path'
        isOriginal
        isViewOnly={false}
        places={null}
        more={null}
        onCopy={onCopy}
      />
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
    root.render(
      <SyncedBlockBar
        name=''
        isOriginal={false}
        isViewOnly={false}
        places={null}
        more={null}
        onCopy={onCopy}
      />
    )
  )
  expect(text()).toContain('Synced block')
  expect(text()).not.toContain('Original')
})

test('a read-only block shows a View only bar that keeps Copy and sync', () => {
  const onCopy = jest.fn()
  act(() =>
    root.render(
      <SyncedBlockBar
        name='Escalation path'
        isOriginal
        isViewOnly
        places={null}
        more={null}
        onCopy={onCopy}
      />
    )
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

test('a viewer sees no placeholder in an empty block', () => {
  const host = mountHost()
  const nested = mountNested(host, findLinkPositions(host)[0]!, ['', ''])
  nested.setEditable(false)
  const {doc} = nested.state
  const firstParagraphPos = doc.firstChild!.nodeSize
  expect(
    syncedBlockPlaceholderText({editor: nested, node: doc.child(1), pos: firstParagraphPos})
  ).toBe('')
  expect(
    syncedBlockPlaceholderText({
      editor: nested,
      node: doc.child(2),
      pos: firstParagraphPos + doc.child(1).nodeSize
    })
  ).toBe('')
})

const flushTimers = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)))

const mountView = () => {
  const host = new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit, PageLinkBlockBase.extend({addStorage: () => ({pageId: 'page:1'})})],
    content: {type: 'doc', content: [{type: 'paragraph'}, syncedLink]}
  })
  const linkPos = findLinkPositions(host)[0]!
  hostRef.current = host
  mockNestedEditor = mountNested(host, linkPos, ['Sev 1: page the on-call lead.'])
  const props = {
    node: host.state.doc.nodeAt(linkPos)!,
    editor: host,
    getPos: () => linkPos
  } as unknown as NodeViewProps
  act(() => root.render(<SyncedBlockView {...props} />))
}

test('keeps the bar while the places menu is open', async () => {
  mountView()
  const wrapper = container.querySelector<HTMLElement>('[data-synced-block]')!
  act(() => wrapper.focus())
  expect(copyButton()).toBeDefined()
  const placesButton = Array.from(container.querySelectorAll('button')).find(
    (button) => button.textContent === 'Also on 1 page'
  )!
  act(() => {
    placesButton.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}))
  })
  const menu = document.body.querySelector<HTMLElement>('[role="menu"]')!
  expect(menu.textContent).toContain('Runbook')
  act(() => menu.focus())
  await flushTimers()
  expect(copyButton()).toBeDefined()
  expect(document.body.querySelector('[role="menu"]')).not.toBeNull()
  act(() => {
    menu.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}))
  })
  await flushTimers()
  expect(document.body.querySelector('[role="menu"]')).toBeNull()
  const outside = document.createElement('button')
  document.body.appendChild(outside)
  act(() => outside.focus())
  await flushTimers()
  expect(copyButton()).toBeUndefined()
  expect(text()).toContain('Escalation path')
  outside.remove()
})

const nameButton = () =>
  Array.from(container.querySelectorAll('button')).find(
    (button) => button.textContent === 'Escalation path'
  )
const nameInput = () => container.querySelector<HTMLInputElement>('input[aria-label="Block name"]')
const typeInto = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')!.set!
  act(() => {
    setter.call(input, value)
    input.dispatchEvent(new Event('input', {bubbles: true}))
  })
}
const pressKey = (input: HTMLInputElement, key: string) =>
  act(() => {
    input.dispatchEvent(new KeyboardEvent('keydown', {key, bubbles: true, cancelable: true}))
  })

const mountFocusedView = () => {
  mountView()
  const wrapper = container.querySelector<HTMLElement>('[data-synced-block]')!
  act(() => wrapper.focus())
  return wrapper
}

test('clicking the name opens the rename input with the name selected', () => {
  mountFocusedView()
  act(() => nameButton()!.click())
  const input = nameInput()!
  expect(input.value).toBe('Escalation path')
  expect(input.placeholder).toBe('Name this block')
  expect(document.activeElement).toBe(input)
  expect(input.selectionStart).toBe(0)
  expect(input.selectionEnd).toBe('Escalation path'.length)
})

test('Enter commits and Escape cancels', () => {
  mountFocusedView()
  act(() => nameButton()!.click())
  typeInto(nameInput()!, 'Paging policy')
  pressKey(nameInput()!, 'Enter')
  expect(mockNestedEditor!.state.doc.firstChild?.textContent).toBe('Paging policy')
  expect(nameInput()).toBeNull()
  expect(text()).toContain('Paging policy')

  act(() =>
    Array.from(container.querySelectorAll('button'))
      .find((button) => button.textContent === 'Paging policy')!
      .click()
  )
  typeInto(nameInput()!, 'Discarded')
  pressKey(nameInput()!, 'Escape')
  expect(mockNestedEditor!.state.doc.firstChild?.textContent).toBe('Paging policy')
  expect(nameInput()).toBeNull()
})

test('Enter does not commit a second time on blur', () => {
  mountFocusedView()
  const spy = jest.spyOn(mockNestedEditor!.view, 'dispatch')
  act(() => nameButton()!.click())
  typeInto(nameInput()!, 'Paging policy')
  const input = nameInput()!
  pressKey(input, 'Enter')
  expect(spy).toHaveBeenCalledTimes(1)
})

test('committing returns focus to the host with the block node-selected', () => {
  mountFocusedView()
  act(() => nameButton()!.click())
  pressKey(nameInput()!, 'Escape')
  const selection = hostRef.current!.state.selection
  expect(selection.constructor.name).toBe('NodeSelection')
})

test('the view-only bar name is not clickable', () => {
  const onStartRename = jest.fn()
  act(() =>
    root.render(
      <SyncedBlockBar
        name='Escalation path'
        isOriginal
        isViewOnly
        places={null}
        more={null}
        onStartRename={onStartRename}
        onCopy={jest.fn()}
      />
    )
  )
  expect(nameButton()).toBeUndefined()
})

test('the rename event opens the input', () => {
  const wrapper = mountFocusedView()
  expect(nameInput()).toBeNull()
  act(() => {
    wrapper.dispatchEvent(new CustomEvent(SYNCED_BLOCK_RENAME_EVENT))
  })
  expect(nameInput()).not.toBeNull()
})
