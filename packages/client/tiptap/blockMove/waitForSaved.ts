import type {HocuspocusProvider} from '@hocuspocus/provider'

export const BLOCK_MOVE_TIMEOUT_MS = 10_000

export type SavingProvider = Pick<HocuspocusProvider, 'hasUnsyncedChanges' | 'on' | 'off'>

export const waitForSaved = (provider: SavingProvider, timeoutMs: number) =>
  new Promise<boolean>((resolve) => {
    if (!provider.hasUnsyncedChanges) {
      resolve(true)
      return
    }
    const finish = (saved: boolean) => {
      clearTimeout(timer)
      provider.off('unsyncedChanges', onUnsyncedChanges)
      resolve(saved)
    }
    const onUnsyncedChanges = ({number}: {number: number}) => {
      if (number === 0) finish(true)
    }
    const timer = setTimeout(() => finish(false), timeoutMs)
    provider.on('unsyncedChanges', onUnsyncedChanges)
  })
