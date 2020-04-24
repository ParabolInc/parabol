const svgToPng = (svg: File, minHeight = 200) => {
  return new Promise<Blob | null>((resolve) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      const scale = Math.max(1, minHeight / img.height)
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      context.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        resolve(blob)
      })
    }
    img.src = URL.createObjectURL(svg)
  })
}

export default svgToPng
