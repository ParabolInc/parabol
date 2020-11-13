import mime from 'mime-types'
import {JSDOM} from 'jsdom'
import sanitizeSVG from '@mattkrick/sanitize-svg'

const validateAvatarUpload = async (
  contentType: string,
  buffer: Buffer
): Promise<[string, Buffer]> => {
  if (typeof process.env.CDN_BASE_URL === 'undefined') {
    throw new Error('CDN_BASE_URL environment variable is not defined')
  }
  if (!contentType || !contentType.startsWith('image/')) {
    throw new Error('file must be an image')
  }
  const ext = mime.extension(contentType)
  if (!ext) {
    throw new Error(`unable to determine extension for ${contentType}`)
  }
  if (ext === 'svg') {
    const {window} = new JSDOM()
    const safeBuffer = await sanitizeSVG(buffer, window)
    if (!safeBuffer) throw new Error('Attempted Stored XSS attack')
    return [ext, safeBuffer as Buffer]
  }
  return [ext, buffer]
}

export default validateAvatarUpload
