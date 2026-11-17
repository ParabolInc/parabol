import type {Editor} from '@tiptap/core'
import {fetchQuery, readInlineData} from 'relay-runtime'
import syncedBlockDialogPageFragment, {
  type SyncedBlockDialog_page$key
} from '../../../__generated__/SyncedBlockDialog_page.graphql'
import syncedBlockDialogQuery, {
  type SyncedBlockDialogQuery
} from '../../../__generated__/SyncedBlockDialogQuery.graphql'
import type Atmosphere from '../../../Atmosphere'
import {GQLID} from '../../../utils/GQLID'
import {getUnsyncCopyConfirm, type UnsyncCopyConfirm} from './getUnsyncCopyConfirm'
import {showSyncedBlockUnsyncSnack} from './showSyncedBlockUnsyncSnack'
import {unsyncSyncedCopy} from './unsyncSyncedCopy'

interface Params {
  atmosphere: Atmosphere
  hostEditor: Editor
  getPos: () => number | undefined
  pageCode: number
  onConfirmNeeded: (confirm: UnsyncCopyConfirm) => void
}

const readBlockPage = async (atmosphere: Atmosphere, pageCode: number) => {
  const data = await fetchQuery<SyncedBlockDialogQuery>(
    atmosphere,
    syncedBlockDialogQuery,
    {pageId: GQLID.toKey(pageCode, 'page')},
    {fetchPolicy: 'network-only'}
  )
    .toPromise()
    .catch(() => undefined)
  const pageRef = data?.public.page
  return pageRef
    ? readInlineData<SyncedBlockDialog_page$key>(syncedBlockDialogPageFragment, pageRef)
    : null
}

export const unsyncCopyAt = (
  atmosphere: Atmosphere,
  hostEditor: Editor,
  pos: number | undefined,
  pageCode: number
) => {
  if (hostEditor.isDestroyed || pos === undefined) return
  if (!unsyncSyncedCopy(hostEditor, pos, pageCode)) return
  showSyncedBlockUnsyncSnack(atmosphere, hostEditor)
  hostEditor.commands.focus()
}

export const requestSyncedBlockUnsyncCopy = async (params: Params) => {
  const {atmosphere, hostEditor, getPos, pageCode, onConfirmNeeded} = params
  const currentPageId = hostEditor.storage.pageLinkBlock.pageId
  const page = await readBlockPage(atmosphere, pageCode)
  const check = page ? getUnsyncCopyConfirm(page, currentPageId) : {kind: 'unknown' as const}
  if (check.kind === 'unknown') {
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: 'SyncedBlockUnsyncFailed',
      message: "Couldn't unsync this copy. Try again.",
      autoDismiss: 5
    })
    return
  }
  if (check.kind === 'confirm') {
    onConfirmNeeded({title: check.title, body: check.body})
    return
  }
  unsyncCopyAt(atmosphere, hostEditor, getPos(), pageCode)
}
