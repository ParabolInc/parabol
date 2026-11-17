export const CONFLUENCE_EXPORT_SEEN_KEY = 'confluenceExportSeen'
export const CONFLUENCE_EXPORT_BADGE_SUNSET = '2026-09-30'
export const CONFLUENCE_HELP_URL = 'https://www.parabol.co/integrations/confluence'

export const confluenceExportDestKey = (teamId: string) => `confluenceExportDest:${teamId}`

export type StoredExportDest = {cloudId: string; spaceId: string; spaceName: string}

export const readConfluenceExportDest = (teamId: string): StoredExportDest | null => {
  try {
    const raw = window.localStorage.getItem(confluenceExportDestKey(teamId))
    return raw ? (JSON.parse(raw) as StoredExportDest) : null
  } catch {
    return null
  }
}
