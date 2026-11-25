export const downloadImage = async (src: string) => {
  const res = await fetch(src)
  const blob = await res.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  const url = new URL(src)
  link.download = url.pathname.split('/').pop()!
  link.click()
  window.URL.revokeObjectURL(blobUrl)
}
