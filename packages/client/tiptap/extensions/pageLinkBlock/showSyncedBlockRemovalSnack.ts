import type {Editor} from '@tiptap/core'
import {fetchQuery, readInlineData} from 'relay-runtime'
import syncedBlockPlacesPageFragment, {
  type SyncedBlockPlaces_page$key
} from '../../../__generated__/SyncedBlockPlaces_page.graphql'
import syncedBlockPlacesQuery, {
  type SyncedBlockPlacesQuery
} from '../../../__generated__/SyncedBlockPlacesQuery.graphql'
import type Atmosphere from '../../../Atmosphere'
import type {SnackLink} from '../../../components/Snackbar'
import type {useArchivePageMutation} from '../../../mutations/useArchivePageMutation'
import type {PageLinkBlockAttrs} from '../../../shared/tiptap/extensions/PageLinkBlockBase'
import {GQLID} from '../../../utils/GQLID'
import {type TrackedRange, trackRange} from '../../blockMove/trackRange'
import {getPageSlug} from '../../getPageSlug'
import {getSyncedBlockPlaces} from './getSyncedBlockPlaces'
import {getSyncedBlockRemovalNotice} from './getSyncedBlockRemovalNotice'
import {countSyncedLinks, type SyncedBlockRemoval} from './syncedBlockRemovalPlugin'

const SYNCED_BLOCK_REMOVED_SNACK_KEY = 'SyncedBlockRemoved'

type Params = {
  atmosphere: Atmosphere
  editor: Editor
  navigate: (path: string) => void
  executeArchive: ReturnType<typeof useArchivePageMutation>[0]
  removal: SyncedBlockRemoval
}

let releaseShown: (() => void) | null = null

const readSyncedBlockPage = async (atmosphere: Atmosphere, pageId: string) => {
  const data = await fetchQuery<SyncedBlockPlacesQuery>(
    atmosphere,
    syncedBlockPlacesQuery,
    {pageId},
    {fetchPolicy: 'store-or-network'}
  )
    .toPromise()
    .catch(() => undefined)
  const pageRef = data?.public.page
  return pageRef
    ? readInlineData<SyncedBlockPlaces_page$key>(syncedBlockPlacesPageFragment, pageRef)
    : null
}

const isBackOnPage = (editor: Editor, pageCode: number) =>
  countSyncedLinks(editor.state.doc, pageCode) > 0

const reinsertCopy = (editor: Editor, attrs: PageLinkBlockAttrs, gap: TrackedRange) => {
  if (editor.isDestroyed || isBackOnPage(editor, Number(attrs.pageCode))) return
  const {state, view} = editor
  const at = gap.current()?.from ?? state.doc.content.size
  const copy = state.schema.nodes.pageLinkBlock!.create({...attrs, canonical: false})
  view.dispatch(state.tr.insert(at, copy))
}

export const showSyncedBlockRemovalSnack = async ({
  atmosphere,
  editor,
  navigate,
  executeArchive,
  removal
}: Params) => {
  const {pageCode, attrs, pos} = removal
  const gap = trackRange(editor, pos, pos)
  const pageId = GQLID.toKey(pageCode, 'page')
  const page = await readSyncedBlockPage(atmosphere, pageId)
  const placements = page?.syncedBlockPlacements
  const currentPageId = editor.storage.pageLinkBlock.pageId
  const promotedHost = placements?.pages.find(
    ({isOriginal, page}) => isOriginal && page.id !== currentPageId
  )?.page
  const notice = placements
    ? getSyncedBlockRemovalNotice({
        removal,
        places: {
          ...getSyncedBlockPlaces(placements, currentPageId),
          successor: promotedHost ?? placements.successor
        },
        viewerIsOwner: page.access.viewer === 'owner'
      })
    : null
  const isUndoLost = notice?.kind !== 'trash' && editor.isDestroyed
  const isBack = !editor.isDestroyed && isBackOnPage(editor, pageCode)
  if (!notice || notice.kind === 'none' || isUndoLost || isBack) {
    gap.stop()
    return
  }
  releaseShown?.()
  atmosphere.eventEmitter.emit('removeSnackbar', ({key}) => key === SYNCED_BLOCK_REMOVED_SNACK_KEY)
  const release = () => {
    gap.stop()
    editor.off('destroy', removeSnack)
    editor.off('transaction', removeSnackWhenBack)
    if (releaseShown === release) releaseShown = null
  }
  const removeSnack = () => {
    atmosphere.eventEmitter.emit('removeSnackbar', ({onDismiss}) => onDismiss === release)
    release()
  }
  const removeSnackWhenBack = () => {
    if (isBackOnPage(editor, pageCode)) removeSnack()
  }
  releaseShown = release
  editor.on('transaction', removeSnackWhenBack)
  if (notice.kind === 'trash') {
    gap.stop()
  } else {
    editor.on('destroy', removeSnack)
  }
  const undo =
    notice.undo === 'restore'
      ? () => {
          executeArchive({variables: {pageId, action: 'restore'}})
        }
      : () => {
          reinsertCopy(editor, attrs, gap)
        }
  const successorLink = notice.kind === 'original' ? notice.link : null
  const link: SnackLink | undefined = successorLink
    ? {
        label: successorLink.title,
        suffix: successorLink.suffix,
        callback: () => {
          removeSnack()
          const [successorCode] = GQLID.fromKey(successorLink.pageId)
          navigate(`/pages/${getPageSlug(successorCode, successorLink.title)}`)
        }
      }
    : undefined
  atmosphere.eventEmitter.emit('addSnackbar', {
    key: SYNCED_BLOCK_REMOVED_SNACK_KEY,
    message: notice.message,
    autoDismiss: 10,
    onDismiss: release,
    action: {label: 'Undo', callback: undo},
    ...(link && {link})
  })
}
