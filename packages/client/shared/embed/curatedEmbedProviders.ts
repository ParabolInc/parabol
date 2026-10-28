import type {EmbedAspectRatio} from './embedTypes'

export type CuratedEmbedResult = {
  embedSrc: string
  providerName: string
  aspectRatio: EmbedAspectRatio
}

/**
 * Hosts we are willing to put inside an iframe. This is a security boundary, not a
 * convenience list: `embedSrc` lives in a Yjs document, so any collaborator with edit
 * access can write it straight over the websocket, bypassing the server resolver.
 * The node view re-checks against this list before rendering.
 */
export const EMBED_HOST_ALLOWLIST = [
  'youtube.com',
  'youtube-nocookie.com',
  'loom.com',
  'vimeo.com',
  'docs.google.com',
  'figma.com',
  'miro.com',
  'codepen.io',
  'spotify.com',
  'soundcloud.com',
  'twitch.tv',
  'whimsical.com',
  'wistia.net',
  'canva.com',
  'replit.com',
  'observablehq.com',
  'tiktok.com',
  'speakerdeck.com',
  'dwcdn.net'
]

export const isAllowedEmbedHost = (src: string | null | undefined): boolean => {
  if (!src) return false
  let url: URL
  try {
    url = new URL(src)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  const host = url.hostname.toLowerCase()
  return EMBED_HOST_ALLOWLIST.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))
}

const YOUTUBE_ID = /^[\w-]{6,20}$/
// The share dialog emits 1m30s past the first minute; plain seconds is the older form
const YOUTUBE_DURATION = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/
const parseYouTubeSeconds = (raw: string | null) => {
  if (!raw) return 0
  if (/^\d+$/.test(raw)) return Number.parseInt(raw, 10)
  const match = YOUTUBE_DURATION.exec(raw)
  if (!match || raw === '') return 0
  const [, h, m, sec] = match
  return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(sec ?? 0)
}
const parseYouTube = (url: URL): CuratedEmbedResult | null => {
  const host = url.hostname.replace(/^www\./, '')
  let id: string | undefined
  if (host === 'youtu.be') {
    id = url.pathname.slice(1).split('/')[0]
  } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    const [, segment, pathId] = url.pathname.split('/')
    if (segment === 'watch') {
      id = url.searchParams.get('v') ?? undefined
    } else if (segment === 'shorts' || segment === 'live' || segment === 'embed') {
      id = pathId
    }
  }
  if (!id || !YOUTUBE_ID.test(id)) return null
  const start = url.searchParams.get('t') ?? url.searchParams.get('start')
  const seconds = parseYouTubeSeconds(start)
  const query = seconds > 0 ? `?start=${seconds}` : ''
  return {
    embedSrc: `https://www.youtube-nocookie.com/embed/${id}${query}`,
    providerName: 'YouTube',
    aspectRatio: '16:9'
  }
}

const LOOM_ID = /^[a-zA-Z0-9]{8,}$/
const parseLoom = (url: URL): CuratedEmbedResult | null => {
  const [, segment, id] = url.pathname.split('/')
  if (segment !== 'share' || !id || !LOOM_ID.test(id)) return null
  return {
    embedSrc: `https://www.loom.com/embed/${id}`,
    providerName: 'Loom',
    aspectRatio: '16:9'
  }
}

const parseVimeo = (url: URL): CuratedEmbedResult | null => {
  const [, id] = url.pathname.split('/')
  if (!id || !/^\d+$/.test(id)) return null
  return {
    embedSrc: `https://player.vimeo.com/video/${id}`,
    providerName: 'Vimeo',
    aspectRatio: '16:9'
  }
}

const GOOGLE_DOC_ID = /^[\w-]+$/
type GoogleKind = {
  provider: string
  aspectRatio: EmbedAspectRatio
  suffix: 'preview' | 'embed'
}
const GOOGLE_KINDS: Record<string, GoogleKind> = {
  document: {provider: 'Google Docs', aspectRatio: '4:3', suffix: 'preview'},
  spreadsheets: {provider: 'Google Sheets', aspectRatio: '4:3', suffix: 'preview'},
  presentation: {provider: 'Google Slides', aspectRatio: '16:9', suffix: 'embed'}
}
const parseGoogle = (url: URL): CuratedEmbedResult | null => {
  const [, kind, d, first, second] = url.pathname.split('/')
  if (!kind || d !== 'd') return null
  if (kind === 'forms') {
    // forms use /forms/d/e/<id>/viewform
    const id = first === 'e' ? second : first
    if (!id || !GOOGLE_DOC_ID.test(id)) return null
    const path = first === 'e' ? `d/e/${id}` : `d/${id}`
    return {
      embedSrc: `https://docs.google.com/forms/${path}/viewform?embedded=true`,
      providerName: 'Google Forms',
      aspectRatio: '4:3'
    }
  }
  const config = GOOGLE_KINDS[kind]
  if (!config || !first || !GOOGLE_DOC_ID.test(first)) return null
  return {
    embedSrc: `https://docs.google.com/${kind}/d/${first}/${config.suffix}`,
    providerName: config.provider,
    aspectRatio: config.aspectRatio
  }
}

const FIGMA_KINDS = new Set(['file', 'design', 'board', 'slides', 'proto', 'deck'])
const parseFigma = (url: URL): CuratedEmbedResult | null => {
  const [, kind] = url.pathname.split('/')
  if (!kind || !FIGMA_KINDS.has(kind)) return null
  return {
    embedSrc: `https://www.figma.com/embed?embed_host=parabol&url=${encodeURIComponent(url.href)}`,
    providerName: 'Figma',
    aspectRatio: '16:9'
  }
}

const parseMiro = (url: URL): CuratedEmbedResult | null => {
  const [, app, board, id] = url.pathname.split('/')
  if (app !== 'app' || board !== 'board' || !id) return null
  return {
    embedSrc: `https://miro.com/app/live-embed/${id}`,
    providerName: 'Miro',
    aspectRatio: '16:9'
  }
}

const parseCodePen = (url: URL): CuratedEmbedResult | null => {
  const [, user, pen, id] = url.pathname.split('/')
  if (!user || pen !== 'pen' || !id) return null
  return {
    embedSrc: `https://codepen.io/${user}/embed/${id}`,
    providerName: 'CodePen',
    aspectRatio: '4:3'
  }
}

const SPOTIFY_KINDS = new Set(['track', 'album', 'playlist', 'episode', 'show', 'artist'])
const parseSpotify = (url: URL): CuratedEmbedResult | null => {
  const [, kind, id] = url.pathname.split('/')
  if (!kind || !SPOTIFY_KINDS.has(kind) || !id) return null
  return {
    embedSrc: `https://open.spotify.com/embed/${kind}/${id}`,
    providerName: 'Spotify',
    aspectRatio: 'tall'
  }
}

const PARSERS: Record<string, (url: URL) => CuratedEmbedResult | null> = {
  'youtube.com': parseYouTube,
  'm.youtube.com': parseYouTube,
  'music.youtube.com': parseYouTube,
  'youtu.be': parseYouTube,
  'loom.com': parseLoom,
  'vimeo.com': parseVimeo,
  'docs.google.com': parseGoogle,
  'figma.com': parseFigma,
  'miro.com': parseMiro,
  'codepen.io': parseCodePen,
  'open.spotify.com': parseSpotify
}

/**
 * Deterministic URL to embed-src transforms for providers we care about.
 * Runs before any network call, so the client can render these instantly on paste,
 * and wins over the oEmbed registry (which does not cover Google Docs at all).
 */
export const resolveCuratedEmbed = (rawUrl: string): CuratedEmbedResult | null => {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.toLowerCase().replace(/^www\./, '')
  const parser = PARSERS[host] ?? PARSERS[url.hostname.toLowerCase()]
  if (!parser) return null
  return parser(url)
}
