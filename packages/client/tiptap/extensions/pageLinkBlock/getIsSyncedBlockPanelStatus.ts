import type {SyncedBlockStatus} from './useSyncedBlockProvider'

export const getIsSyncedBlockPanelStatus = (status: SyncedBlockStatus) =>
  status === 'locked' || status === 'error'
