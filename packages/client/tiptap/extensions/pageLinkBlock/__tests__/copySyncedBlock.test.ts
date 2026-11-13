import {Editor, type JSONContent} from '@tiptap/core'
import {NodeSelection} from '@tiptap/pm/state'
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

const fireCopy = (editor: Editor) => {
  const data = new Map<string, string>()
  const event = {
    type: 'copy',
    clipboardData: {
      clearData: () => data.clear(),
      setData: (type: string, value: string) => data.set(type, value)
    },
    preventDefault: jest.fn()
  }
  const handled = !!editor.view.someProp('handleDOMEvents', (handlers) =>
    handlers.copy?.(editor.view, event as unknown as ClipboardEvent)
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

  test('pasting the original onto another page makes a copy', () => {
    const {host, linkPos} = mountSyncedPage()
    selectNode(host, linkPos)
    const {dom} = host.view.serializeForClipboard(host.state.selection.content())
    expect(dom.innerHTML).toContain('data-canonical')
    const otherPage = mountPage([{type: 'paragraph'}])
    pasteAtEnd(otherPage, dom.innerHTML)
    expect(linkAttrs(otherPage)).toEqual([
      expect.objectContaining({pageCode: 7, canonical: false, synced: true})
    ])
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

  test('plain copy of a node-selected synced block puts the synced HTML on the clipboard', () => {
    const {host, linkPos, nested} = mountSyncedPage()
    selectNode(host, linkPos)
    const {handled, data} = fireCopy(host)
    expect(handled).toBe(true)
    expect(data.get('text/html')).toBe(serializeSyncedBlock({pageCode: 7, title: ''}, nested).html)
    expect(data.get('text/plain')).toBe('Sev 1\nSev 2')
  })

  test('plain copy of an ordinary page link is unchanged', () => {
    const page = mountPage([{type: 'paragraph'}, plainLink, {type: 'paragraph'}])
    selectNode(page, findLinkPositions(page)[0]!)
    expect(fireCopy(page).handled).toBe(false)
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
