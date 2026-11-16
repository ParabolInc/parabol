import type {HocuspocusProvider} from '@hocuspocus/provider'
import {waitUntil} from './waitUntil'

export const BLOCK_MOVE_TIMEOUT_MS = 10_000

export type SavingProvider = Pick<HocuspocusProvider, 'hasUnsyncedChanges' | 'on' | 'off'>

export const waitForSaved = (provider: SavingProvider, timeoutMs: number) =>
  waitUntil(
    () => !provider.hasUnsyncedChanges,
    (onChange) => {
      provider.on('unsyncedChanges', onChange)
      return () => provider.off('unsyncedChanges', onChange)
    },
    timeoutMs
  )
