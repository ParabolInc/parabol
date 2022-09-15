import sanitizeSVG from '@mattkrick/sanitize-svg'
import {JSDOM} from 'jsdom'
import mime from 'mime-types'

const validateAvatarUpload = async (
  contentType: string,
  buffer: Buffer
): Promise<[string, Buffer]> => {
  if (!contentType || !contentType.startsWith('image/')) {
    throw new Error('file must be an image')
  }
  const ext = mime.extension(contentType)
  if (!ext) {
    throw new Error(`unable to determine extension for ${contentType}`)
  }
  if (ext === 'svg') {
    const {window} = new JSDOM()
    const safeBuffer = await sanitizeSVG(buffer, window as any)
    if (!safeBuffer) throw new Error('Attempted Stored XSS attack')
    return [ext, safeBuffer as Buffer]
  }
  return [ext, buffer]
}

export default validateAvatarUpload
