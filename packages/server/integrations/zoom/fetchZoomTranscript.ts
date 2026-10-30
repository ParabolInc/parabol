import {fetchUntrusted} from '../../utils/fetchUntrusted'
import {Logger} from '../../utils/Logger'

const MAX_TRANSCRIPT_BYTES = 10_000_000
// Zoom answers a download_url with a redirect to the file itself
const MAX_DOWNLOAD_REDIRECTS = 3

const isZoomUrl = (url: string) => {
  try {
    const {protocol, hostname} = new URL(url)
    return protocol === 'https:' && (hostname === 'zoom.us' || hostname.endsWith('.zoom.us'))
  } catch {
    return false
  }
}

export const fetchZoomTranscript = async (downloadUrl: string, downloadToken: string) => {
  if (!isZoomUrl(downloadUrl)) {
    Logger.warn('Refused a Zoom transcript download_url outside zoom.us')
    return null
  }
  const transcript = await fetchUntrusted(downloadUrl, MAX_TRANSCRIPT_BYTES, {
    headers: {Authorization: `Bearer ${downloadToken}`},
    maxRedirects: MAX_DOWNLOAD_REDIRECTS
  })
  return transcript?.buffer.toString() ?? null
}
