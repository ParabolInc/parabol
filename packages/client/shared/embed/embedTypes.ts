export type EmbedDisplayMode = 'embed' | 'card'

export type EmbedAspectRatio = '16:9' | '4:3' | '1:1' | 'tall'

export type EmbedAlign = 'left' | 'center' | 'right'

/** Everything a resolver can learn about a URL. All fields beyond `url` are provider-derived. */
export type EmbedMetadata = {
  url: string
  embedSrc?: string | null
  title?: string | null
  description?: string | null
  thumbnailUrl?: string | null
  faviconUrl?: string | null
  providerName?: string | null
  authorName?: string | null
  aspectRatio?: EmbedAspectRatio | null
  fetchedAt?: string | null
}

/**
 * Attributes written onto the node. Split into two classes that never mix:
 * user intent is only ever written by the person editing, provider-derived
 * is only ever written by the server. Background revalidation cannot fight a
 * formatting choice because it cannot address those fields.
 */
export type EmbedBlockUserAttrs = {
  url: string
  displayMode: EmbedDisplayMode
  align: EmbedAlign
  width?: number
  isFullWidth: boolean
  aspectRatio: EmbedAspectRatio
}

export type EmbedBlockProviderAttrs = {
  embedSrc?: string
  title?: string
  description?: string
  thumbnailUrl?: string
  faviconUrl?: string
  providerName?: string
  authorName?: string
  fetchedAt?: string
}

export type EmbedBlockAttrs = EmbedBlockUserAttrs & EmbedBlockProviderAttrs

export const PROVIDER_ATTR_KEYS = [
  'embedSrc',
  'title',
  'description',
  'thumbnailUrl',
  'faviconUrl',
  'providerName',
  'authorName',
  'fetchedAt'
] as const satisfies readonly (keyof EmbedBlockProviderAttrs)[]
