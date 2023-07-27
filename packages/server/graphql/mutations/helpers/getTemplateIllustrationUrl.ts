// this can be removed after we sunset the old meeting template UI
const getTemplateIllustrationUrl = (filename: string) => {
  const cdnType = process.env.FILE_STORE_PROVIDER
  const partialPath = `Organization/aGhostOrg/template/${filename}`
  if (cdnType === 'local') {
    return `/self-hosted/${partialPath}`
  } else if (cdnType === 's3') {
    const {AWS_S3_BUCKET, CDN_BASE_URL} = process.env
    if (!CDN_BASE_URL) throw new Error('Missng Env: CDN_BASE_URL')
    const baseUrl = new URL(CDN_BASE_URL.replace(/^\/+/, 'https://'))
    const {hostname, pathname} = baseUrl
    if (!hostname || !pathname) {
      throw new Error('CDN_BASE_URL ENV VAR IS INVALID')
    }
    const environment = pathname.replace(/^\//, '')
    if (!AWS_S3_BUCKET) throw new Error('Missng Env: AWS_S3_BUCKET')
    return `https://${AWS_S3_BUCKET}/${environment}/store/${partialPath}`
  }
  throw new Error('Mssing Env: FILE_STORE_PROVIDER')
}

export default getTemplateIllustrationUrl
