import '../../__tests__/installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import type {Slice} from '@tiptap/pm/model'
import {NodeSelection, TextSelection} from '@tiptap/pm/state'
import StarterKit from '@tiptap/starter-kit'
import {EventEmitter} from 'events'
import * as Y from 'yjs'
import type Atmosphere from '../../../../Atmosphere'
import {happyWindow} from '../../__tests__/installHappyDom'
import {copySyncedBlock} from '../copySyncedBlock'
import {PageLinkBlock} from '../PageLinkBlock'
import {serializeSyncedBlock} from '../serializeSyncedBlock'
import {findLinkPositions, mountNested, plainLink, syncedLink} from './syncedBlockTestHarness'

jest.mock('../PageLinkNodeView', () => ({__esModule: true, PageLinkNodeView: () => null}))

const mountPage = (content: JSONContent[]) =>
  new Editor({
    element: document.createElement('div'),
    extensions: [
      StarterKit,
      PageLinkBlock.extend({addNodeView: null}).configure({yDoc: new Y.Doc()})
    ],
    content: {type: 'doc', content}
  })

const linkAttrs = (editor: Editor) =>
  findLinkPositions(editor).map((pos) => editor.state.doc.nodeAt(pos)!.attrs)

const pasteAtEnd = (editor: Editor, html: string) => {
  editor.commands.setTextSelection(editor.state.doc.content.size - 1)
  editor.view.pasteHTML(html)
}

const selectNode = (editor: Editor, pos: number) =>
  editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos)))

const fireClipboardEvent = (editor: Editor, type: 'copy' | 'cut' = 'copy') => {
  const data = new Map<string, string>()
  const event = {
    type,
    clipboardData: {
      clearData: () => data.clear(),
      setData: (type: string, value: string) => data.set(type, value)
    },
    preventDefault: jest.fn()
  }
  const handled = !!editor.view.someProp('handleDOMEvents', (handlers) =>
    handlers[type]?.(editor.view, event as unknown as ClipboardEvent)
  )
  return {handled, data}
}

const mountSyncedPage = () => {
  const host = mountPage([{type: 'paragraph'}, syncedLink, {type: 'paragraph'}])
  const [linkPos] = findLinkPositions(host)
  const nested = mountNested(host, linkPos!, ['Sev 1', 'Sev 2'])
  return {host, linkPos: linkPos!, nested}
}

for (const key of ['ClipboardItem', 'ClipboardEvent'] as const) {
  Object.defineProperty(globalThis, key, {value: happyWindow[key], configurable: true})
}

describe('copy and sync', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('the copied HTML is a synced, non-canonical link carrying the content', () => {
    const {nested} = mountSyncedPage()
    const {html, text} = serializeSyncedBlock({pageCode: 7, title: 'Escalation path'}, nested)
    expect(html).toContain('data-type="pageLinkBlock"')
    expect(html).toContain('data-id="7"')
    expect(html).toContain('data-synced')
    expect(html).not.toContain('data-canonical')
    expect(html).toContain('<p>Sev 1</p>')
    expect(html).not.toContain('Escalation path</h1>')
    expect(text).toBe('Sev 1\nSev 2')
  })

  test('pasting a copied block onto its own page makes a copy', () => {
    const {host, nested} = mountSyncedPage()
    pasteAtEnd(host, serializeSyncedBlock({pageCode: 7, title: ''}, nested).html)
    expect(linkAttrs(host)).toEqual([
      expect.objectContaining({pageCode: 7, canonical: true, synced: true}),
      expect.objectContaining({pageCode: 7, canonical: false, synced: true})
    ])
  })

  test('cut and paste of an original keeps it canonical', () => {
    const {host, linkPos} = mountSyncedPage()
    selectNode(host, linkPos)
    expect(fireClipboardEvent(host, 'cut').handled).toBe(false)
    const {dom} = host.view.serializeForClipboard(host.state.selection.content())
    host.commands.deleteSelection()
    const otherPage = mountPage([{type: 'paragraph'}])
    pasteAtEnd(otherPage, dom.innerHTML)
    expect(linkAttrs(otherPage)).toEqual([
      expect.objectContaining({pageCode: 7, canonical: true, synced: true})
    ])
  })

  test('drag-moving an original keeps it canonical', () => {
    const host = mountPage([
      {type: 'paragraph', content: [{type: 'text', text: 'first'}]},
      syncedLink,
      {type: 'paragraph', content: [{type: 'text', text: 'last'}]}
    ])
    const [linkPos] = findLinkPositions(host)
    selectNode(host, linkPos!)
    const {view} = host
    let slice: Slice = view.state.selection.content()
    view.dragging = {slice, move: true}
    view.someProp('transformPasted', (transform) => {
      slice = transform(slice, view, false)
    })
    const tr = view.state.tr.deleteSelection()
    const dropPos = tr.doc.content.size
    tr.replaceRangeWith(dropPos, dropPos, slice.content.firstChild!)
    view.dispatch(tr)
    view.dragging = null
    expect(host.state.doc.child(2).type.name).toBe('pageLinkBlock')
    expect(linkAttrs(host)).toEqual([
      expect.objectContaining({pageCode: 7, canonical: true, synced: true})
    ])
  })

  test('copying a text range that includes an original puts a copy on the clipboard', () => {
    const host = mountPage([
      {type: 'paragraph', content: [{type: 'text', text: 'before'}]},
      syncedLink,
      {type: 'paragraph', content: [{type: 'text', text: 'after'}]}
    ])
    host.view.dispatch(
      host.state.tr.setSelection(
        TextSelection.create(host.state.doc, 2, host.state.doc.content.size - 2)
      )
    )
    const {handled, data} = fireClipboardEvent(host)
    expect(handled).toBe(true)
    const html = data.get('text/html')!
    expect(html).toContain('data-synced')
    expect(html).not.toContain('data-canonical')
    expect(html).toContain('efore')
    expect(data.get('text/plain')).toContain('efore')
    pasteAtEnd(host, html)
    expect(linkAttrs(host)).toEqual([
      expect.objectContaining({pageCode: 7, canonical: true, synced: true}),
      expect.objectContaining({pageCode: 7, canonical: false, synced: true})
    ])
  })

  test('copying a text range with no synced block is left to the default', () => {
    const page = mountPage([
      {type: 'paragraph', content: [{type: 'text', text: 'before'}]},
      {...plainLink, attrs: {...plainLink.attrs, canonical: true}},
      {type: 'paragraph', content: [{type: 'text', text: 'after'}]}
    ])
    page.view.dispatch(
      page.state.tr.setSelection(
        TextSelection.create(page.state.doc, 2, page.state.doc.content.size - 2)
      )
    )
    expect(fireClipboardEvent(page).handled).toBe(false)
  })

  test('pasting an ordinary sub-page link onto another page keeps it canonical', () => {
    const page = mountPage([
      {type: 'paragraph'},
      {...plainLink, attrs: {...plainLink.attrs, canonical: true}}
    ])
    selectNode(page, findLinkPositions(page)[0]!)
    const {dom} = page.view.serializeForClipboard(page.state.selection.content())
    const otherPage = mountPage([{type: 'paragraph'}])
    pasteAtEnd(otherPage, dom.innerHTML)
    expect(linkAttrs(otherPage)).toEqual([
      expect.objectContaining({pageCode: 8, canonical: true, synced: false})
    ])
  })

  test.each([
    ['not a number', 'x'],
    ['out of range', '99999999999'],
    ['zero', '0'],
    ['missing', '']
  ])('a pasted page link whose page code is %s is dropped', (_label, dataId) => {
    const page = mountPage([{type: 'paragraph'}])
    pasteAtEnd(
      page,
      `<p>kept</p><div data-type="pageLinkBlock" data-synced data-id="${dataId}"></div><div data-type="pageLinkBlock" data-canonical data-id="${dataId}"></div>`
    )
    expect(findLinkPositions(page)).toEqual([])
    expect(page.state.doc.textContent).toContain('kept')
  })

  test('inside a synced block every pasted page link is a copy', () => {
    const page = mountPage([
      {type: 'paragraph'},
      {...plainLink, attrs: {...plainLink.attrs, canonical: true}},
      syncedLink
    ])
    const {dom} = page.view.serializeForClipboard(
      page.state.doc.slice(page.state.doc.child(0).nodeSize, page.state.doc.content.size)
    )
    const block = new Editor({
      element: document.createElement('div'),
      extensions: [
        StarterKit,
        PageLinkBlock.extend({addNodeView: null}).configure({
          yDoc: new Y.Doc(),
          pastedLinksAreCopies: true
        })
      ],
      content: {type: 'doc', content: [{type: 'paragraph'}]}
    })
    pasteAtEnd(block, dom.innerHTML)
    expect(linkAttrs(block)).toEqual([
      expect.objectContaining({pageCode: 8, canonical: false}),
      expect.objectContaining({pageCode: 7, canonical: false, synced: true})
    ])
  })

  test('plain copy of a node-selected synced block puts the synced HTML on the clipboard', () => {
    const {host, linkPos, nested} = mountSyncedPage()
    selectNode(host, linkPos)
    const {handled, data} = fireClipboardEvent(host)
    expect(handled).toBe(true)
    expect(data.get('text/html')).toBe(serializeSyncedBlock({pageCode: 7, title: ''}, nested).html)
    expect(data.get('text/plain')).toBe('Sev 1\nSev 2')
  })

  test('plain copy of an ordinary page link is unchanged', () => {
    const page = mountPage([{type: 'paragraph'}, plainLink, {type: 'paragraph'}])
    selectNode(page, findLinkPositions(page)[0]!)
    expect(fireClipboardEvent(page).handled).toBe(false)
  })

  const mountAtmosphere = () => {
    const eventEmitter: Atmosphere['eventEmitter'] = new EventEmitter()
    const emit = jest.spyOn(eventEmitter, 'emit')
    return {atmosphere: {eventEmitter}, emit}
  }

  const stubClipboard = (clipboard: Partial<Clipboard>) =>
    Object.defineProperty(navigator, 'clipboard', {value: clipboard, configurable: true})

  test('Copy and sync shows the copied toast', async () => {
    const {nested} = mountSyncedPage()
    const write = jest.fn().mockResolvedValue(undefined)
    stubClipboard({write})
    const {atmosphere, emit} = mountAtmosphere()
    await copySyncedBlock({pageCode: 7, title: ''}, nested, atmosphere)
    expect(write).toHaveBeenCalledTimes(1)
    const [item] = write.mock.calls[0][0] as ClipboardItem[]
    expect(item!.types).toEqual(['text/html', 'text/plain'])
    expect(emit).toHaveBeenCalledWith('addSnackbar', {
      key: 'SyncedBlockCopied',
      message: 'Copied. Paste on any page to sync it.',
      autoDismiss: 5
    })
  })

  test('falls back to plain text when the browser cannot write HTML', async () => {
    const {nested} = mountSyncedPage()
    const writeText = jest.fn().mockResolvedValue(undefined)
    stubClipboard({writeText})
    const {atmosphere, emit} = mountAtmosphere()
    await copySyncedBlock({pageCode: 7, title: ''}, nested, atmosphere)
    expect(writeText).toHaveBeenCalledWith('Sev 1\nSev 2')
    expect(emit).toHaveBeenCalledWith(
      'addSnackbar',
      expect.objectContaining({key: 'SyncedBlockCopied'})
    )
  })

  test('shows no toast when the clipboard refuses', async () => {
    const {nested} = mountSyncedPage()
    stubClipboard({write: jest.fn().mockRejectedValue(new Error('denied'))})
    const {atmosphere, emit} = mountAtmosphere()
    await expect(
      copySyncedBlock({pageCode: 7, title: ''}, nested, atmosphere)
    ).resolves.toBeUndefined()
    expect(emit).not.toHaveBeenCalled()
  })
})
