import getKysely from '../../../postgres/getKysely'
import type {Page} from '../../../postgres/types'
import {selectUnsyncOutcomes} from '../../../utils/tiptap/selectUnsyncOutcomes'
import type {SyncedBlockPlacementResolvers} from '../resolverTypes'

export type SyncedBlockPlacementSource = {
  page: Page
  isOriginal: boolean
  blockId: number
}

const SyncedBlockPlacement: SyncedBlockPlacementResolvers = {
  hiddenReaderCount: async ({page, blockId}) => {
    const outcomes = await selectUnsyncOutcomes(getKysely(), blockId, [page.id])
    return outcomes.get(page.id)!.hiddenReaderCount
  }
}

export default SyncedBlockPlacement
