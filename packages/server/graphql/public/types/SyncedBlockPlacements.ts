import type {Page} from '../../../postgres/types'
import type {SyncedBlockPlacementsResolvers} from '../resolverTypes'
import type {SyncedBlockPlacementSource} from './SyncedBlockPlacement'

export type SyncedBlockPlacementsSource = {
  pages: SyncedBlockPlacementSource[]
  hiddenCount: number
  successor: Page | null
}

const SyncedBlockPlacements: SyncedBlockPlacementsResolvers = {}

export default SyncedBlockPlacements
