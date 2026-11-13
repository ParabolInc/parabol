import sanitizeSVG from '@mattkrick/sanitize-svg'
import mime from 'mime-types'
import loadHappyDom from '../utils/loadHappyDom'

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
    const {Window} = loadHappyDom()
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
