import plural from '../../../utils/plural'
import type {SyncedBlockPlaces} from './getSyncedBlockPlaces'
import type {SyncedBlockRemoval} from './syncedBlockRemovalPlugin'

interface Successor {
  readonly id: string
  readonly title: string | null | undefined
}

export type SyncedBlockRemovalNotice =
  | {kind: 'none'}
  | {kind: 'copy'; message: string; undo: 'reinsertCopy'}
  | {
      kind: 'original'
      message: string
      link: {pageId: string; title: string; suffix: string} | null
      undo: 'reinsertCopy'
    }
  | {kind: 'trash'; message: 'Moved to trash'; undo: 'restore'}

interface Params {
  removal: Pick<SyncedBlockRemoval, 'isOriginal'>
  places: Pick<SyncedBlockPlaces, 'otherCount'> & {successor: Successor | null | undefined}
  viewerIsOwner: boolean
}

export const getSyncedBlockRemovalNotice = ({
  removal,
  places,
  viewerIsOwner
}: Params): SyncedBlockRemovalNotice => {
  const {otherCount, successor} = places
  if (otherCount === 0) {
    return viewerIsOwner
      ? {kind: 'trash', message: 'Moved to trash', undo: 'restore'}
      : {kind: 'none'}
  }
  const message = `Removed here. Still on ${otherCount} ${plural(otherCount, 'page')}.`
  if (!removal.isOriginal) return {kind: 'copy', message, undo: 'reinsertCopy'}
  const link = successor
    ? {
        pageId: successor.id,
        title: successor.title || '<Untitled>',
        suffix: ' now holds the original.'
      }
    : null
  return {kind: 'original', message, link, undo: 'reinsertCopy'}
}
