import {toSlug} from 'parabol-client/shared/toSlug'

export const buildMeetingSeriesSlug = (id: number, title: string) => {
  const titleSlug = toSlug(title || '')
  return titleSlug ? `${titleSlug}-${id}` : `${id}`
}

export const parseMeetingSeriesSlug = (slug: string): number | null => {
  const dashIdx = slug.lastIndexOf('-')
  const idStr = dashIdx === -1 ? slug : slug.slice(dashIdx + 1)
  if (!/^\d+$/.test(idStr)) return null
  const id = Number(idStr)
  if (!Number.isFinite(id)) return null
  return id
}
