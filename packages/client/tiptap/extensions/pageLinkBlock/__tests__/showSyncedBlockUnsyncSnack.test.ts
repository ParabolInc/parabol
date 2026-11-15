import '../../__tests__/installHappyDom'
import {Editor, type JSONContent} from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import {Document} from '@tiptap/extension-document'
import * as Y from 'yjs'
import type Atmosphere from '../../../../Atmosphere'
import type {Snack} from '../../../../components/Snackbar'
import {serverTipTapExtensions} from '../../../../shared/tiptap/serverTipTapExtensions'
import {h, p, seed} from '../../../blockMove/__tests__/blockMoveTestHelpers'
import {BlockMoveHistory} from '../../BlockMoveHistory'
import {showSyncedBlockUnsyncSnack} from '../showSyncedBlockUnsyncSnack'
import {unsyncSyncedCopy} from '../unsyncSyncedCopy'
import {findLinkPositions, mountNested, syncedLink} from './syncedBlockTestHarness'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../../../../hooks/usePageViewerAccess', () => ({
  lookupPageViewerAccess: () => undefined
}))

const syncedCopy: JSONContent = {...syncedLink, attrs: {...syncedLink.attrs, canonical: false}}

const emit = jest.fn()
const atmosphere = {eventEmitter: {emit}} as unknown as Atmosphere
let editor: Editor
let hostDoc: Y.Doc

const mountCollabHost = (ydoc: Y.Doc) =>
  new Editor({
    element: document.createElement('div'),
    extensions: [
      Document.extend({content: 'heading block*'}),
      ...serverTipTapExtensions.map((extension) =>
        extension.name === 'starterKit'
          ? extension.configure({document: false, undoRedo: false, trailingNode: false})
          : extension
      ),
      Collaboration.configure({document: ydoc}),
      BlockMoveHistory.configure({atmosphere})
    ]
  })

const linkAttrs = () =>
  findLinkPositions(editor).map((pos) => {
    const {pageCode, canonical, synced} = editor.state.doc.nodeAt(pos)!.attrs
    return {pageCode, canonical, synced}
  })

const unsyncWithSnack = () => {
  const linkPos = findLinkPositions(editor)[0]!
  mountNested(editor, linkPos, ['Sev 1'])
  expect(unsyncSyncedCopy(editor, linkPos, 7)).toBe(true)
  showSyncedBlockUnsyncSnack(atmosphere, editor)
  const snack = emit.mock.calls.findLast(([event]) => event === 'addSnackbar')![1] as Snack
  const isClosed = () =>
    emit.mock.calls.some(
      ([event, filter]) => event === 'removeSnackbar' && (filter as (s: Snack) => boolean)(snack)
    )
  return {snack, isClosed}
}

beforeEach(() => {
  emit.mockClear()
  hostDoc = seed(h(1, 'Runbook'), p('Above'), syncedCopy, p('Below')).doc!
  editor = mountCollabHost(hostDoc)
})

afterEach(() => {
  if (!editor.isDestroyed) editor.destroy()
})

test('Undo restores the synced copy while the unsync is the newest change', () => {
  const {snack} = unsyncWithSnack()
  expect(snack).toMatchObject({
    key: 'SyncedBlockUnsynced',
    autoDismiss: 10,
    message: 'This copy now has its own text.',
    action: {label: 'Undo'}
  })
  expect(linkAttrs()).toEqual([])
  snack.action!.callback()
  expect(linkAttrs()).toEqual([{pageCode: 7, canonical: false, synced: true}])
  expect(editor.getText()).not.toContain('Sev 1')
})

test('Undo does nothing after another local edit, and that edit closes the toast', () => {
  const {snack, isClosed} = unsyncWithSnack()
  expect(isClosed()).toBe(false)
  editor.commands.insertContentAt(editor.state.doc.content.size, p('typed after'))
  expect(isClosed()).toBe(true)
  snack.action!.callback()
  expect(linkAttrs()).toEqual([])
  expect(editor.getText()).toContain('typed after')
})

test('a remote change leaves the toast open', () => {
  const {snack, isClosed} = unsyncWithSnack()
  const remoteDoc = new Y.Doc()
  Y.applyUpdate(remoteDoc, Y.encodeStateAsUpdate(hostDoc))
  const remote = remoteDoc.getXmlFragment('default')
  const below = remote.get(remote.length - 1) as Y.XmlElement
  ;(below.get(0) as Y.XmlText).insert(0, 'remote ')
  Y.applyUpdate(hostDoc, Y.encodeStateAsUpdate(remoteDoc, Y.encodeStateVector(hostDoc)))
  expect(editor.getText()).toContain('remote Below')
  expect(isClosed()).toBe(false)
  snack.action!.callback()
  expect(linkAttrs()).toEqual([{pageCode: 7, canonical: false, synced: true}])
  expect(editor.getText()).toContain('remote Below')
})
