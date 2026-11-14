import {createContext} from 'react'

export const MAX_SYNCED_BLOCK_DEPTH = 3

export const SyncedBlockChainContext = createContext<number[] | null>(null)

export const pageCodeFromPageId = (pageId: string | undefined) => {
  const code = Number(pageId?.split(':')[1])
  return Number.isInteger(code) && code > 0 ? code : undefined
}

export const getEnclosingChain = (provided: number[] | null, hostPageId: string | undefined) => {
  if (provided) return provided
  const hostCode = pageCodeFromPageId(hostPageId)
  return hostCode === undefined ? [] : [hostCode]
}

export const canNestSyncedBlock = (chain: number[], pageCode: number) =>
  !chain.includes(pageCode) && chain.length <= MAX_SYNCED_BLOCK_DEPTH
