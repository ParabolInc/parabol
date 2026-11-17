const PREFIX = '#synced-block-'

export const getSyncedBlockHash = (blockPageCode: number) => `${PREFIX}${blockPageCode}`

export const parseSyncedBlockHash = (hash: string) => {
  if (!hash.startsWith(PREFIX)) return null
  const digits = hash.slice(PREFIX.length)
  if (!/^\d+$/.test(digits)) return null
  const code = Number(digits)
  return Number.isSafeInteger(code) && code > 0 ? code : null
}
