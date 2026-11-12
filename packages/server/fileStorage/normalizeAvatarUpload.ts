import loadSharp from '../utils/loadSharp'

const normalizeAvatarUpload = async (ext: string, buffer: Buffer): Promise<[string, Buffer]> => {
  const sharp = await loadSharp()
  const resizedBuffer = await sharp(buffer).resize(200, 200).toBuffer()
  if (ext === 'svg') {
    const pngBuffer = await sharp(resizedBuffer).png().toBuffer()
    return ['png', pngBuffer]
  }
  return [ext, resizedBuffer]
}

export default normalizeAvatarUpload
