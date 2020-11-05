import sanitizeSVG from '@mattkrick/sanitize-svg'
import {JSDOM} from 'jsdom'
import sharp from 'sharp'

const validateSafeSVG = async (buffer: Buffer): Promise<void> => {
  const {window} = new JSDOM()
  const safeBuffer = await sanitizeSVG(buffer, window)
  if (!safeBuffer) throw new Error('Attempted Stored XSS attack')
}

const validateSVGUpload = async (buffer: Buffer): Promise<Buffer> => {
  await validateSafeSVG(buffer)
  const pngBuffer = await sharp(buffer).png().toBuffer()
  return pngBuffer
}

export default validateSVGUpload
