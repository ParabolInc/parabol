const resizeImageWithCanvas = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  maxFileSizeBytes: number
) => {
  return new Promise<File>((resolve, reject) => {
    const img = document.createElement('img')
    img.src = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = (maxHeight / width) * height
          width = maxWidth
        } else {
          width = (maxWidth / height) * width
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      // Compress iteratively to meet max file size
      let quality = 1.0 // Start with full quality
      canvas.toBlob(
        function compress(blob) {
          if (quality <= 0.1) {
            reject('Could not reduce file size')
          } else if (blob!.size <= maxFileSizeBytes) {
            resolve(blob as File)
          } else {
            quality -= 0.05
            canvas.toBlob(compress, 'image/jpeg', quality)
          }
        },
        'image/jpeg',
        quality
      )
    }
    img.onerror = (err) => reject(err)
  })
}

export default resizeImageWithCanvas
