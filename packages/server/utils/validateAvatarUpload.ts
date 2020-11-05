import mime from 'mime-types'
import validateSVGUpload from './validateSVGUpload'

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
  if (contentType === 'image/svg+xml') {
    const pngBuffer = await validateSVGUpload(buffer)
    return ['png', pngBuffer]
  }
  return [ext, buffer]
}

export default validateAvatarUpload
