import {fetch} from '@whatwg-node/fetch'

export const getSSOMetadataFromURL = async (metadataURL: string) => {
  const normalizedURL = metadataURL.trim()
  if (!normalizedURL.startsWith('https://'))
    return new Error('Metadata URL must start with https://')
  try {
    const metadataRes = await fetch(normalizedURL)
    const {status} = metadataRes
    if (status !== 200) return new Error('Metadata URL could not be reached')
    // content-type may be application/samlmetadata+xml or application/xml or ???
    // we do not check for that here since it's not deterministic
    const metadata = await metadataRes.text()
    return metadata
  } catch (e) {
    return new Error('Metadata URL could not be fetched')
  }
}
