import {fetch} from '@whatwg-node/fetch'
import mime from 'mime-types'
import appOrigin from '../../../../../appOrigin'
import {pageAccessByUserIdBatchFn} from '../../../../../dataloader/pageAccessByUserIdBatchFn'
import type {PartialPath} from '../../../../../fileStorage/FileStoreManager'
import getFileStoreManager from '../../../../../fileStorage/getFileStoreManager'
import {CipherId} from '../../../../../utils/CipherId'

/**
 * Validates that an asset src is an app-origin Page asset with a well-formed key.
 * Returns the decrypted owning pageId so callers can enforce the same PageAccess check
 * the asset proxy applies — never presign a user-supplied key without it.
 */
export const parseAssetKey = (
  srcUrl: string,
  origin: string
): {pageId: number; partialPath: PartialPath} | null => {
  const prefix = srcUrl.startsWith(`${origin}/assets/`)
    ? `${origin}/assets/`
    : srcUrl.startsWith('/assets/')
      ? '/assets/'
      : null
  if (!prefix) return null
  const rawPath = srcUrl.slice(prefix.length)
  let decoded: string
  try {
    decoded = decodeURIComponent(rawPath)
  } catch {
    return null
  }
  if (decoded.includes('..') || decoded.includes('\\') || decoded.startsWith('/')) return null
  const match = decoded.match(/^Page\/(\d+)\/assets\/[^/]+$/)
  if (!match) return null
  const pageId = CipherId.decrypt(Number(match[1]))
  return {pageId, partialPath: decoded as PartialPath}
}

// Parabol asset URLs are auth-gated; the file store is presign-only, so read bytes by
// presigning the validated key and fetching the resulting URL. The viewer must be able to
// view the asset's owning page (mirrors assetProxyHandler's access check).
export const fetchAssetBuffer = async (
  srcUrl: string,
  viewerId: string
): Promise<{buffer: Buffer; mimeType: string} | null> => {
  const parsed = parseAssetKey(srcUrl, appOrigin)
  if (!parsed) return null
  const [role] = await pageAccessByUserIdBatchFn([{pageId: parsed.pageId, userId: viewerId}])
  if (!role) return null
  try {
    const manager = getFileStoreManager()
    const presignedUrl = await manager.presignUrl(parsed.partialPath)
    const res = await fetch(presignedUrl)
    if (!res.ok) return null
    const mimeType =
      res.headers.get('Content-Type') ??
      (mime.lookup(parsed.partialPath) || 'application/octet-stream')
    return {buffer: Buffer.from(await res.arrayBuffer()), mimeType}
  } catch {
    return null
  }
}
