import sharp from 'sharp'

export const compressImage = async (buffer: Buffer, ext: string) => {
  const extension = ext.replace(/^\./, '')
  if (extension === 'avif') return {buffer, extension}
  const animationFormats = ['gif', 'webp']
  if (animationFormats.includes(extension)) {
    const image = sharp(buffer, {animated: true})
    const {pages} = await image.metadata()
    if (pages && pages > 1) {
      if (extension === 'webp') return {buffer, extension}
      // animated AVIF isn't supported by sharp yet, so fallback to using webp
      const webpBuffer = await image.webp({quality: 80}).toBuffer()
      return {buffer: webpBuffer, extension: 'webp'}
    }
  }
  // AVIF is the goal format,
  const avifBuffer = await sharp(buffer).avif({quality: 70}).toBuffer()
  return {buffer: avifBuffer, extension: 'avif'}
}
