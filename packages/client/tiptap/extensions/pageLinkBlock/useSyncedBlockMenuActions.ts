import type {Editor} from '@tiptap/core'
import {useNavigate} from 'react-router'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {GQLID} from '../../../utils/GQLID'
import {getPageSlug} from '../../getPageSlug'
import {copySyncedBlock} from './copySyncedBlock'
import {deleteSyncedBlockFromPage} from './deleteSyncedBlockFromPage'
import {duplicateSyncedBlockAsPlain} from './duplicateSyncedBlockAsPlain'
import type {SyncedBlockMenuRow} from './getSyncedBlockMenuRows'
import {getSyncedLinkAt} from './getSyncedLinkAt'
import {startSyncedBlockRename} from './startSyncedBlockRename'
import {getNestedEditor} from './syncedBlockFocus'

export interface SyncedBlockOriginal {
  pageId: string
  title: string
}

interface Params {
  hostEditor: Editor
  getPos: () => number | undefined
  pageCode: number
  original: SyncedBlockOriginal | null
  runAfterClose: (action: () => void) => void
}

export const useSyncedBlockMenuActions = (params: Params) => {
  const {hostEditor, getPos, pageCode, original, runAfterClose} = params
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const withPos = (action: (pos: number) => void) => {
    const pos = getPos()
    if (pos !== undefined) action(pos)
  }
  const afterClose = (action: (pos: number) => void) => () =>
    runAfterClose(() => {
      withPos(action)
      hostEditor.commands.focus()
    })
  const actions: Record<SyncedBlockMenuRow, () => void> = {
    copyAndSync: () =>
      withPos((pos) => {
        const block = getSyncedLinkAt(hostEditor.state.doc, pos, pageCode)
        if (!block) return
        const content = getNestedEditor(hostEditor.view, pos)
        copySyncedBlock({pageCode, title: block.attrs.title}, content, atmosphere)
      }),
    goToOriginal: () => {
      if (!original) return
      const [originalPageCode] = GQLID.fromKey(original.pageId)
      navigate(`/pages/${getPageSlug(originalPageCode, original.title)}`)
    },
    rename: () =>
      runAfterClose(() => withPos((pos) => startSyncedBlockRename(hostEditor.view, pos, pageCode))),
    duplicatePlain: afterClose((pos) => duplicateSyncedBlockAsPlain(hostEditor, pos, pageCode)),
    deleteFromPage: afterClose((pos) => deleteSyncedBlockFromPage(hostEditor, pos, pageCode))
  }
  return actions
}
