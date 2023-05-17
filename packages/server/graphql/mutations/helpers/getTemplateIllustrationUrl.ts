// this can be removed after we sunset the old meeting template UI
const getTemplateIllustrationUrl = (filename: string) => {
  const cdnType = process.env.FILE_STORE_PROVIDER
  const partialPath = `store/Organization/aGhostOrg/${filename}`
  if (cdnType === 'local') {
    return `/self-hosted/${partialPath}`
  }
  const hostPath = process.env.CDN_BASE_URL!.replace(/^\/+/, '')
  return `https://${hostPath}/${partialPath}`
}

export default getTemplateIllustrationUrl
