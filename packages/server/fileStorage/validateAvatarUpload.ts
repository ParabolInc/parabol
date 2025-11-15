import sanitizeSVG from '@mattkrick/sanitize-svg'
import {Window} from 'happy-dom'
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
    const localWindow = new Window()
    try {
      const safeBuffer = await sanitizeSVG(buffer, localWindow as any)
      if (!safeBuffer) throw new Error('Attempted Stored XSS attack')
      return [ext, safeBuffer as Buffer]
    } finally {
      localWindow.happyDOM.abort()
      localWindow.happyDOM.close()
    }
  }
  return [ext, buffer]
}

export default validateAvatarUpload
