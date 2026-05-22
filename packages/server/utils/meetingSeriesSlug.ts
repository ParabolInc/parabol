import {toSlug} from 'parabol-client/shared/toSlug'
import {feistelCipher} from './feistelCipher'

// Format mirrors Pages: `<slug>-<cipher>`. Decode keys off the trailing cipher only.
export const buildMeetingSeriesSlug = (id: number, title: string) => {
  const cipher = feistelCipher.encrypt(id)
  const titleSlug = toSlug(title || '')
  return titleSlug ? `${titleSlug}-${cipher}` : `${cipher}`
}

export const parseMeetingSeriesSlug = (slug: string): number | null => {
  const dashIdx = slug.lastIndexOf('-')
  const cipherStr = dashIdx === -1 ? slug : slug.slice(dashIdx + 1)
  if (!/^\d+$/.test(cipherStr)) return null
  const code = Number(cipherStr)
  if (!Number.isFinite(code)) return null
  return feistelCipher.decrypt(code)
}
