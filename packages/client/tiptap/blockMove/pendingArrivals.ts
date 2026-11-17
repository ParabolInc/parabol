import type {MovedBlock} from './appendBlocksToFragment'

const EXPIRES_AFTER_MS = 15_000

const pendingArrivals = new Map<string, {moved: readonly MovedBlock[]; setAt: number}>()

export const setPendingArrival = (pageId: string, moved: readonly MovedBlock[]) => {
  pendingArrivals.set(pageId, {moved, setAt: Date.now()})
}

export const peekPendingArrival = (pageId: string) => {
  const entry = pendingArrivals.get(pageId)
  if (!entry) return null
  if (Date.now() - entry.setAt > EXPIRES_AFTER_MS) {
    pendingArrivals.delete(pageId)
    return null
  }
  return entry.moved
}

export const takePendingArrival = (pageId: string) => {
  const moved = peekPendingArrival(pageId)
  pendingArrivals.delete(pageId)
  return moved
}
