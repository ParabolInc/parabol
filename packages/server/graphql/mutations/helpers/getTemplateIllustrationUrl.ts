// this can be removed after we sunset the old meeting template UI
const getTemplateIllustrationUrl = (filename: string) => {
  const cdnType = process.env.FILE_STORE_PROVIDER
  const partialPath = `Organization/aGhostOrg/${filename}`
  if (cdnType === 'local') {
    return `/self-hosted/${partialPath}`
  } else if (cdnType === 's3') {
    const {CDN_BASE_URL} = process.env
    if (!CDN_BASE_URL) throw new Error('Missng Env: CDN_BASE_URL')
    const hostPath = CDN_BASE_URL.replace(/^\/+/, '')
    return `https://${hostPath}/store/${partialPath}`
  }
  throw new Error('Mssing Env: FILE_STORE_PROVIDER')
}

export default getTemplateIllustrationUrl
