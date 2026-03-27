import makeAppURL from '../../client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import {fetchUntrusted} from './fetchUntrusted'

const MAX_METADATA_SIZE = 1_000_000 // 1 MB

export const getSSOMetadataFromURL = async (metadataURL: string) => {
  let normalizedURL = metadataURL.trim()
  if (normalizedURL.startsWith('/')) {
    // URLs shouldn't be relative, but we had a migration that made them so
    normalizedURL = makeAppURL(appOrigin, normalizedURL)
  }
  if (!normalizedURL.startsWith('https://'))
    return new Error('Metadata URL must start with https://')
  // content-type may be application/samlmetadata+xml or application/xml or ???
  // we do not check for that here since it's not deterministic
  const result = await fetchUntrusted(normalizedURL, MAX_METADATA_SIZE)
  if (!result) return new Error('Metadata URL could not be fetched')
  return result.buffer.toString('utf-8')
}
