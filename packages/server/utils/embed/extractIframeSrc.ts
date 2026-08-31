import {isAllowedEmbedHost} from '../../../client/shared/embed/curatedEmbedProviders'

const IFRAME_SRC = /<iframe\b[^>]*?\ssrc\s*=\s*("([^"]*)"|'([^']*)')/i

const decodeEntities = (value: string) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")

/**
 * oEmbed responses hand back arbitrary provider HTML. We never inject it: many
 * providers ship script-based embeds that cannot work in a sandbox anyway, and
 * owning the sizing is what makes the presentation modes possible. Pull out the
 * single iframe src, verify it, and store only that.
 */
export const extractIframeSrc = (html: string | undefined | null): string | null => {
  if (!html) return null
  const match = IFRAME_SRC.exec(html)
  const raw = match?.[2] ?? match?.[3]
  if (!raw) return null
  const src = decodeEntities(raw.trim())
  return isAllowedEmbedHost(src) ? src : null
}
