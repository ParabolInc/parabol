import type {Page} from '../../../postgres/types'
import type {SyncedBlockPlacementsResolvers} from '../resolverTypes'

export type SyncedBlockPlacementsSource = {
  pages: {page: Page; isOriginal: boolean}[]
  hiddenCount: number
  successor: Page | null
}

const SyncedBlockPlacements: SyncedBlockPlacementsResolvers = {}

export default SyncedBlockPlacements
