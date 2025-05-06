import {fetch} from '@whatwg-node/fetch'
import {MAX_REQUEST_TIME} from 'parabol-client/utils/constants'
import sendToSentry from './sendToSentry'

interface TenorResponse {
  results: ResponseObject[]
  next: string
}

interface ResponseObject {
  created: number // Unix timestamp representing when this post was created
  hasaudio: boolean // Indicates if the post contains audio (only video formats support audio)
  id: string // Tenor result identifier
  media_formats: Partial<Record<MediaFilter, MediaObject>> // Dictionary with content format as the key and MediaObject as the value
  tags: string[] // Array of tags for the post
  title: string // Title of the post
  content_description: string // Textual description of the content
  itemurl: string // Full URL to view the post on tenor.com
  hascaption: boolean // Indicates if the post contains captions
  flags: string // Comma-separated list to describe content properties (e.g., sticker, static, audio)
  bg_color: string // Most common background pixel color of the content
  url: string // Short URL to view the post on tenor.com
}

interface MediaObject {
  url: string // URL to the media content
  duration?: number // Duration of the media (if applicable)
  preview?: string // URL to the preview image (if applicable)
  dims?: [number, number] // Dimensions of the media (width, height)
  size?: number // Size of the media file in bytes
}

const mediaFilter = [
  'webp',
  'webp_transparent',
  'tinywebp_transparent',
  'nanowebp_transparent'
] as const

type MediaFilter = (typeof mediaFilter)[number]
export class TenorManager {
  apiKey: string
  clientKey: string
  constructor() {
    const {HOST, TENOR_SECRET} = process.env
    if (!TENOR_SECRET) {
      throw new Error('Missing ENV Var: TENOR_SECRET')
    }
    this.apiKey = TENOR_SECRET
    this.clientKey = HOST!
  }

  private async get<T>(url: string): Promise<T | Error> {
    try {
      const res = await fetch(url, {signal: AbortSignal.timeout(MAX_REQUEST_TIME)})
      if (res.status !== 200) {
        return new Error(`${res.status}: ${res.statusText}`)
      }
      const resJSON = await res.json()
      return resJSON as T
    } catch (error) {
      if (error instanceof Error) {
        sendToSentry(error)
        return error
      }
      return new Error('Tenor is not responding')
    }
  }

  async featured(opts: {limit: number; pos?: string | null; country?: string; locale?: string}) {
    const {limit, country, locale, pos} = opts
    const url = new URL(`https://tenor.googleapis.com/v2/featured`)
    const searchParams = {
      key: this.apiKey,
      client_key: this.clientKey,
      media_filter: mediaFilter.join(','),
      limit,
      pos,
      country,
      locale
    }
    Object.entries(searchParams).forEach(([key, value]) => {
      // filters out country, locale
      if (!value) return
      url.searchParams.append(key, value as string)
    })
    return await this.get<TenorResponse>(url.toString())
  }

  async search(opts: {
    query: string
    limit: number
    pos?: string | null
    country?: string
    locale?: string
  }) {
    const {query, limit, country, locale, pos} = opts
    const url = new URL(`https://tenor.googleapis.com/v2/search`)
    const searchParams = {
      key: this.apiKey,
      client_key: this.clientKey,
      media_filter: mediaFilter.join(','),
      limit,
      pos,
      country,
      locale,
      q: query
    }
    Object.entries(searchParams).forEach(([key, value]) => {
      // filters out country, locale
      if (!value) return
      url.searchParams.append(key, value as string)
    })
    return await this.get<TenorResponse>(url.toString())
  }
}
