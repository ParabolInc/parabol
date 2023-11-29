import getFileStoreManager from '../../../fileStorage/getFileStoreManager'

// this can be removed after we sunset the old meeting template UI
type CDN_TYPE = 'local' | 's3' | 'gcs'

const getTemplateIllustrationUrl = (filename: string) => {
  const cdnType = process.env.FILE_STORE_PROVIDER as CDN_TYPE | undefined
  const manager = getFileStoreManager()

  const partialPath = `Organization/aGhostOrg/template/${filename}`
  if (cdnType === 'local') {
    return `/self-hosted/${partialPath}`
  } else {
    const fullPath = manager.prependPath(partialPath)
    return manager.getPublicFileLocation(fullPath)
  }
}

export default getTemplateIllustrationUrl
