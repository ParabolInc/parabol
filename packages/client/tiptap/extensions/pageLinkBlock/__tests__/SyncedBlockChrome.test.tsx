import '../../__tests__/installHappyDom'
import type {HocuspocusProvider} from '@hocuspocus/provider'
import {Editor} from '@tiptap/core'
import type {NodeViewProps} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {MotionGlobalConfig} from 'motion/react'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {PageLinkBlockBase} from '../../../../shared/tiptap/extensions/PageLinkBlockBase'
import {syncedBlockPlaceholderText} from '../../../pagePlaceholderText'
import {SYNCED_BLOCK_DIALOG_EVENT} from '../openSyncedBlockDialog'
import {SyncedBlockBar} from '../SyncedBlockBar'
import {SyncedBlockCaption} from '../SyncedBlockCaption'
import {type SyncedBlockChrome, SyncedBlockEditor} from '../SyncedBlockEditor'
import {SyncedBlockView} from '../SyncedBlockView'
import {SYNCED_BLOCK_RENAME_EVENT} from '../startSyncedBlockRename'
import {focusSyncedBlockOnMount} from '../syncedBlockFocus'
import {useSyncedBlockName} from '../useSyncedBlockName'
import {findLinkPositions, mountNested, syncedLink} from './syncedBlockTestHarness'

MotionGlobalConfig.skipAnimations = true

jest.mock('../../../../components/ErrorComponent/ErrorComponent', () => ({
  __esModule: true,
  default: () => null
}))
let mockNestedEditor: Editor | null = null
let mockChromeState: 'editable' | 'viewOnly' | 'none' = 'editable'
let mockPlacementsChange = () => {}
const mockFetchQuery = jest.fn((..._args: unknown[]) => ({subscribe: jest.fn()}))
jest.mock('relay-runtime', () => ({
  ...jest.requireActual('relay-runtime'),
  fetchQuery: (...args: unknown[]) => mockFetchQuery(...args)
}))
const hostRef: {current: Editor | null} = {current: null}
let mockDragViewer: Record<string, unknown> | null = null
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  useClientQuery: () => ({viewer: mockDragViewer})
}))
jest.mock('../../../../hooks/useTipTapPageEditor', () => ({
  useTipTapPageEditor: () => ({editor: mockNestedEditor})
}))
jest.mock('../../../../components/TipTapEditor/TipTapEditor', () => ({
  TipTapEditor: () => null
}))
jest.mock('../../../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({eventEmitter: {emit: jest.fn()}})
}))
const mockRequestUnsyncCopy = jest.fn()
jest.mock('../requestSyncedBlockUnsyncCopy', () => ({
  ...jest.requireActual('../requestSyncedBlockUnsyncCopy'),
  requestSyncedBlockUnsyncCopy: (params: unknown) => mockRequestUnsyncCopy(params)
}))
jest.mock('../../../../hooks/useQueryLoaderNow', () => ({__esModule: true, default: () => null}))
jest.mock('../../../../mutations/useArchivePageMutation', () => ({
  useArchivePageMutation: () => [jest.fn(), false]
}))
jest.mock('../../../../mutations/useRequestPageAccessMutation', () => ({
  useRequestPageAccessMutation: () => [jest.fn(), false]
}))
jest.mock('../../../../mutations/useUnsyncSyncedBlockMutation', () => ({
  useUnsyncSyncedBlockMutation: () => [jest.fn(), false]
}))
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => jest.fn()
}))
jest.mock('../SyncedBlockWhoHasAccess', () => ({SyncedBlockWhoHasAccess: () => null}))
jest.mock('../useMountNearViewport', () => ({useMountNearViewport: () => true}))
jest.mock('../SyncedBlockContent', () => ({
  SyncedBlockContent: ({
    onChromeChange,
    onPlacementsChange
  }: {
    onChromeChange: (chrome: unknown) => void
    onPlacementsChange: () => void
  }) => {
    const {useEffect} = jest.requireActual<typeof import('react')>('react')
    mockPlacementsChange = onPlacementsChange
    useEffect(() => {
      if (mockChromeState === 'none') return
      onChromeChange({editor: mockNestedEditor, isViewOnly: mockChromeState === 'viewOnly'})
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
  mockChromeState = 'editable'
  mockDragViewer = null
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

const mountView = (link = syncedLink, {isJustMade = false, isHostFocused = false} = {}) => {
  const host = new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit, PageLinkBlockBase.extend({addStorage: () => ({pageId: 'page:1'})})],
    content: {type: 'doc', content: [{type: 'paragraph'}, link]}
  })
  const linkPos = findLinkPositions(host)[0]!
  hostRef.current = host
  host.isFocused = isHostFocused
  mockNestedEditor = mountNested(host, linkPos, ['Sev 1: page the on-call lead.'])
  const node = host.state.doc.nodeAt(linkPos)!
  if (isJustMade) focusSyncedBlockOnMount(node)
  const props = {
    node,
    editor: host,
    getPos: () => findLinkPositions(host)[0]
  } as unknown as NodeViewProps
  act(() => root.render(<SyncedBlockView {...props} />))
  return host
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
  mockFetchQuery.mockClear()
  act(() => mockPlacementsChange())
  expect(mockFetchQuery).not.toHaveBeenCalled()
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

const nestedCaret = () => {
  const {$from} = mockNestedEditor!.state.selection
  return {text: $from.parent.textContent, offset: $from.parentOffset}
}

test.each([
  ['a block just made takes the caret once its editor is ready', true, true, 29],
  ['a block just made leaves the caret alone once the user moved on', true, false, 0],
  ['a block that was already on the page leaves the caret alone', false, true, 0]
])('%s', (_name, isJustMade, isHostFocused, offset) => {
  mountView(syncedLink, {isJustMade, isHostFocused})
  expect(nestedCaret().offset).toBe(offset)
})

const mountFocusedView = (link = syncedLink) => {
  const host = mountView(link)
  const wrapper = container.querySelector<HTMLElement>('[data-synced-block]')!
  act(() => wrapper.focus())
  return Object.assign(wrapper, {host})
}

test('a placements change asks the server for the places while the places menu stays open', async () => {
  mountFocusedView()
  const placesButton = Array.from(container.querySelectorAll('button')).find(
    (button) => button.textContent === 'Also on 1 page'
  )!
  act(() => {
    placesButton.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}))
  })
  act(() => mockPlacementsChange())
  await flushTimers()
  expect(mockFetchQuery).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    {pageId: 'page:7'},
    {fetchPolicy: 'network-only'}
  )
  expect(document.body.querySelector('[role="menu"]')).not.toBeNull()
  expect(copyButton()).toBeDefined()
})

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
  act(() => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true})
    )
    input.dispatchEvent(new Event('focusout', {bubbles: true}))
  })
  expect(spy).toHaveBeenCalledTimes(1)
})

test('blur commits without taking focus or selection back from where the user went', () => {
  mountFocusedView()
  const focusSpy = jest.spyOn(hostRef.current!.view, 'focus')
  const selectionBefore = hostRef.current!.state.selection
  act(() => nameButton()!.click())
  typeInto(nameInput()!, 'Paging policy')
  const outside = document.createElement('button')
  document.body.appendChild(outside)
  act(() => outside.focus())
  expect(mockNestedEditor!.state.doc.firstChild?.textContent).toBe('Paging policy')
  expect(nameInput()).toBeNull()
  expect(focusSpy).not.toHaveBeenCalled()
  expect(hostRef.current!.state.selection.eq(selectionBefore)).toBe(true)
  expect(document.activeElement).toBe(outside)
  outside.remove()
})

test('the rename event is ignored on a view-only block', async () => {
  mockChromeState = 'viewOnly'
  const wrapper = mountFocusedView()
  act(() => {
    wrapper.dispatchEvent(new CustomEvent(SYNCED_BLOCK_RENAME_EVENT))
  })
  expect(nameInput()).toBeNull()
  const outside = document.createElement('button')
  document.body.appendChild(outside)
  act(() => outside.focus())
  await flushTimers()
  expect(text()).not.toContain('View only')
  outside.remove()
})

test('the rename event is ignored before the block loads', () => {
  mockChromeState = 'none'
  const wrapper = mountFocusedView()
  act(() => {
    wrapper.dispatchEvent(new CustomEvent(SYNCED_BLOCK_RENAME_EVENT))
  })
  mockChromeState = 'editable'
  expect(nameInput()).toBeNull()
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

test('rename from the more menu leaves the input open and focused', async () => {
  container.classList.add('react-renderer')
  mountFocusedView()
  jest.spyOn(hostRef.current!.view, 'nodeDOM').mockReturnValue(container)
  const menuOpenAtRename: boolean[] = []
  container.addEventListener(SYNCED_BLOCK_RENAME_EVENT, () => {
    menuOpenAtRename.push(!!document.body.querySelector('[role="menu"]'))
  })
  const more = container.querySelector<HTMLElement>(
    'button[aria-label="More options for this synced block"]'
  )!
  act(() => more.focus())
  act(() => {
    more.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}))
  })
  const menu = document.body.querySelector<HTMLElement>('[role="menu"]')!
  await flushTimers()
  expect(copyButton()).toBeDefined()
  const rename = Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]')).find((item) =>
    item.textContent?.startsWith('Rename')
  )!
  act(() => rename.click())
  await flushTimers()
  await flushTimers()
  expect(menuOpenAtRename).toEqual([false])
  expect(nameInput()).not.toBeNull()
  expect(document.activeElement).toBe(nameInput())
})

test('a view-only bar has no more button', () => {
  mockChromeState = 'viewOnly'
  mountFocusedView()
  expect(text()).toContain('View only')
  expect(
    container.querySelector('button[aria-label="More options for this synced block"]')
  ).toBeNull()
})

const openMoreMenu = async () => {
  const more = container.querySelector<HTMLElement>(
    'button[aria-label="More options for this synced block"]'
  )!
  act(() => more.focus())
  act(() => {
    more.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}))
  })
  await flushTimers()
  return document.body.querySelector<HTMLElement>('[role="menu"]')!
}
const menuItem = (menu: HTMLElement, label: string) =>
  Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]')).find((item) =>
    item.textContent?.startsWith(label)
  )!
const hostBlocks = (host: Editor) => {
  const all: string[] = []
  host.state.doc.forEach((node) => {
    all.push(node.type.name === 'paragraph' ? node.textContent : node.type.name)
  })
  return all
}

test('the more menu deletes the block where it is now, after someone edits above it', async () => {
  const {host} = mountFocusedView()
  const menu = await openMoreMenu()
  act(() => {
    host.view.dispatch(
      host.state.tr.insert(0, host.schema.nodes.paragraph!.create(null, host.schema.text('New')))
    )
  })
  act(() => menuItem(menu, 'Delete from this page').click())
  await flushTimers()
  await flushTimers()
  expect(findLinkPositions(host)).toEqual([])
  expect(hostBlocks(host)[0]).toBe('New')
})

test('the more menu handles the shortcuts its rows show', async () => {
  const {host} = mountFocusedView()
  const menu = await openMoreMenu()
  const duplicateKey = new KeyboardEvent('keydown', {
    key: 'd',
    metaKey: true,
    bubbles: true,
    cancelable: true
  })
  act(() => {
    menuItem(menu, 'Copy and sync').dispatchEvent(duplicateKey)
  })
  await flushTimers()
  await flushTimers()
  expect(duplicateKey.defaultPrevented).toBe(true)
  expect(document.body.querySelector('[role="menu"]')).toBeNull()
  expect(hostBlocks(host).slice(0, 3)).toEqual([
    '',
    'pageLinkBlock',
    'Sev 1: page the on-call lead.'
  ])
  act(() => container.querySelector<HTMLElement>('[data-synced-block]')!.focus())
  const reopened = await openMoreMenu()
  const deleteKey = new KeyboardEvent('keydown', {key: 'Delete', bubbles: true, cancelable: true})
  act(() => {
    menuItem(reopened, 'Copy and sync').dispatchEvent(deleteKey)
  })
  await flushTimers()
  await flushTimers()
  expect(deleteKey.defaultPrevented).toBe(true)
  expect(findLinkPositions(host)).toEqual([])
  expect(hostBlocks(host).slice(0, 2)).toEqual(['', 'Sev 1: page the on-call lead.'])
})

test('Enter and Escape while composing text leave the rename input open', () => {
  mountFocusedView()
  act(() => nameButton()!.click())
  typeInto(nameInput()!, 'ペー')
  for (const key of ['Enter', 'Escape']) {
    act(() => {
      nameInput()!.dispatchEvent(
        new KeyboardEvent('keydown', {key, isComposing: true, bubbles: true, cancelable: true})
      )
    })
  }
  expect(nameInput()?.value).toBe('ペー')
  expect(mockNestedEditor!.state.doc.firstChild?.textContent).toBe('Escalation path')
})

const syncedCopy = {...syncedLink, attrs: {...syncedLink.attrs, canonical: false}}
const confirm = {
  title: 'Show this text to 8 more people?',
  body: "8 people on Q3 Planning can't see this block today. Unsyncing puts its text on the page, where they can read it."
}
const dialogButton = (label: string) =>
  Array.from(document.body.querySelectorAll<HTMLElement>('[role="dialog"] button')).find(
    (button) => button.textContent === label
  )
type ConfirmRequest = {onConfirmNeeded: (c: typeof confirm) => void}
const openUnsyncCopyConfirm = async () => {
  mockRequestUnsyncCopy.mockImplementationOnce(async ({onConfirmNeeded}: ConfirmRequest) =>
    onConfirmNeeded(confirm)
  )
  const wrapper = mountFocusedView(syncedCopy)
  await act(async () => {
    wrapper.dispatchEvent(new CustomEvent(SYNCED_BLOCK_DIALOG_EVENT, {detail: 'unsyncCopy'}))
  })
  return wrapper.host
}

test('the dialog event for unsyncCopy opens the confirm when the check says to ask', async () => {
  const host = await openUnsyncCopyConfirm()
  expect(mockRequestUnsyncCopy).toHaveBeenCalledWith(
    expect.objectContaining({hostEditor: host, pageCode: 7})
  )
  const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]')!
  expect(dialog.textContent).toContain(confirm.title)
  expect(dialog.textContent).toContain(confirm.body)
  expect(dialogButton('Keep synced')).toBeDefined()
  expect(dialogButton('Unsync and show')).toBeDefined()
  expect(copyButton()).toBeDefined()
})

test('Keep synced closes the confirm and leaves the block', async () => {
  const host = await openUnsyncCopyConfirm()
  act(() => dialogButton('Keep synced')!.click())
  expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  expect(findLinkPositions(host)).toHaveLength(1)
})

test('Unsync and show unsyncs the copy', async () => {
  const host = await openUnsyncCopyConfirm()
  act(() => dialogButton('Unsync and show')!.click())
  expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  expect(findLinkPositions(host)).toEqual([])
  expect(hostBlocks(host).slice(0, 2)).toEqual(['', 'Sev 1: page the on-call lead.'])
})

test('confirming after the copy was removed does nothing', async () => {
  const host = await openUnsyncCopyConfirm()
  const linkPos = findLinkPositions(host)[0]!
  act(() => {
    host.view.dispatch(
      host.state.tr.delete(linkPos, linkPos + host.state.doc.nodeAt(linkPos)!.nodeSize)
    )
  })
  const before = host.state.doc
  act(() => dialogButton('Unsync and show')!.click())
  expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  expect(host.state.doc.eq(before)).toBe(true)
})

const openAllDialog = (kind: 'unsyncAll' | 'deleteAll') => {
  const wrapper = mountFocusedView()
  act(() => {
    wrapper.dispatchEvent(new CustomEvent(SYNCED_BLOCK_DIALOG_EVENT, {detail: kind}))
  })
  return document.body.querySelector<HTMLElement>('[role="dialog"]')
}

test('Unsync all opens its dialog while the rows load, and Cancel closes it', () => {
  const dialog = openAllDialog('unsyncAll')!
  expect(dialog.querySelector('h2')?.textContent).toBe('Unsync this block everywhere?')
  expect((dialogButton('Unsync all') as HTMLButtonElement).disabled).toBe(true)
  act(() => dialogButton('Cancel')!.click())
  expect(document.body.querySelector('[role="dialog"]')).toBeNull()
})

test('Delete all says every page while the rows load, and Cancel closes it', () => {
  const dialog = openAllDialog('deleteAll')!
  expect(dialog.querySelector('h2')?.textContent).toBe('Delete this block from every page?')
  expect(dialog.textContent).toContain('Restoring it puts it back on <Untitled> only.')
  expect((dialogButton('Delete all') as HTMLButtonElement).disabled).toBe(true)
  act(() => dialogButton('Cancel')!.click())
  expect(document.body.querySelector('[role="dialog"]')).toBeNull()
})

test('the bar stays up while a dialog is open and gives way to the caption after it closes', async () => {
  openAllDialog('unsyncAll')
  const outside = document.createElement('button')
  document.body.appendChild(outside)
  act(() => outside.focus())
  await flushTimers()
  expect(copyButton()).toBeDefined()
  act(() => dialogButton('Cancel')!.click())
  await flushTimers()
  act(() => outside.focus())
  await flushTimers()
  expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  expect(copyButton()).toBeUndefined()
  expect(text()).toContain('Escalation path')
  outside.remove()
})

const outsideButton = () => {
  const outside = document.createElement('button')
  document.body.appendChild(outside)
  act(() => outside.focus())
  return outside
}

const dispatchUnsyncCopy = (wrapper: HTMLElement) =>
  act(() => {
    wrapper.dispatchEvent(new CustomEvent(SYNCED_BLOCK_DIALOG_EVENT, {detail: 'unsyncCopy'}))
  })

test('the bar stays up while the unsync check runs and after the confirm opens', async () => {
  let finishCheck = () => {}
  mockRequestUnsyncCopy.mockImplementationOnce(
    ({onConfirmNeeded}: ConfirmRequest) =>
      new Promise<void>((resolve) => {
        finishCheck = () => {
          onConfirmNeeded(confirm)
          resolve()
        }
      })
  )
  dispatchUnsyncCopy(mountFocusedView(syncedCopy))
  const outside = outsideButton()
  await flushTimers()
  expect(copyButton()).toBeDefined()
  await act(async () => finishCheck())
  await flushTimers()
  expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain(confirm.title)
  expect(copyButton()).toBeDefined()
  outside.remove()
})

test('the bar gives way once an unsync check that opens nothing settles', async () => {
  let finishCheck = () => {}
  mockRequestUnsyncCopy.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finishCheck = resolve
      })
  )
  dispatchUnsyncCopy(mountFocusedView(syncedCopy))
  const outside = outsideButton()
  await flushTimers()
  expect(copyButton()).toBeDefined()
  await act(async () => finishCheck())
  await flushTimers()
  expect(copyButton()).toBeUndefined()
  outside.remove()
})

const flushFrame = () => act(() => new Promise((resolve) => requestAnimationFrame(resolve)))
const openDialogOfKind = async (kind: 'unsyncCopy' | 'unsyncAll' | 'deleteAll') => {
  if (kind === 'unsyncCopy') return (await openUnsyncCopyConfirm()) as Editor
  openAllDialog(kind)
  return hostRef.current!
}
const dismissDialog = (how: 'Escape' | 'Cancel', kind: string) => {
  if (how === 'Cancel') {
    act(() => dialogButton(kind === 'unsyncCopy' ? 'Keep synced' : 'Cancel')!.click())
    return
  }
  const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]')!
  act(() => {
    dialog.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}))
  })
}

test.each([
  ['unsyncCopy', 'Escape'],
  ['unsyncCopy', 'Cancel'],
  ['unsyncAll', 'Escape'],
  ['unsyncAll', 'Cancel'],
  ['deleteAll', 'Escape'],
  ['deleteAll', 'Cancel']
] as const)('closing the %s dialog with %s returns focus to the page', async (kind, how) => {
  const host = await openDialogOfKind(kind)
  const focusSpy = jest.spyOn(host.view, 'focus')
  dismissDialog(how, kind)
  expect(document.body.querySelector('[role="dialog"]')).toBeNull()
  await flushTimers()
  await flushFrame()
  expect(focusSpy).toHaveBeenCalled()
})

test.each([
  [
    'a block drag carrying a page',
    {draggingBlocksChildPageIds: ['page:9']},
    'read-write',
    'No pages in synced blocks'
  ],
  ['a block drag onto a view-only block', {}, 'readonly', 'View only'],
  [
    'a block drag carrying a copy of the block',
    {draggingBlocksSyncedBlockIds: ['page:7']},
    'read-write',
    'Inside itself'
  ],
  [
    'a block drag from inside the block',
    {draggingBlocksSourcePageId: 'page:7', draggingBlocksChildPageIds: ['page:9']},
    'read-write',
    null
  ],
  [
    'a drag of a page',
    {draggingBlocksSourcePageId: null, draggingPageId: 'page:9'},
    'read-write',
    'No pages in synced blocks'
  ],
  [
    'a drag of the block itself',
    {draggingBlocksSourcePageId: null, draggingPageId: 'page:7'},
    'read-write',
    'Inside itself'
  ]
] as const)('%s marks the block content for the drop hint', (_label, drag, scope, refusal) => {
  mockDragViewer = {draggingBlocksSourcePageId: 'page:1', ...drag}
  mountBlock(scope)
  const content = container.querySelector('[data-synced-editor]')!
  expect(content.getAttribute('data-drop-refused')).toBe(refusal)
  expect(content.getAttribute('data-drop-title')).toBe(refusal && 'Escalation path')
})

test('a host drop on the frame around a refusing block is left to the page', () => {
  mockDragViewer = {draggingBlocksSourcePageId: 'page:1', draggingBlocksChildPageIds: ['page:9']}
  mountView()
  const frame = container.querySelector('[data-synced-block]')!
  expect(frame.closest('[data-drop-in], [data-drop-refused]')).toBeNull()
})
