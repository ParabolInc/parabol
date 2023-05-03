import fs from 'fs'
import getFileStoreManager from 'parabol-server/fileStorage/getFileStoreManager'
import path from 'path'

/* Today, this just syncs meeting template illustrations.
   In the future, we can use this to push an entire client build to a CDN.
   That way each PPMI can function without access to our cloud CDN. #8101
*/
const pushToCDN = async () => {
  const collector = {}
  const context = (require as any).context(
    '../../static/images/illustrations',
    false,
    /Template.png$/
  )
  context.keys().forEach((relativePath) => {
    const {name, ext} = path.parse(relativePath)
    const absBuildPath = context(relativePath).default
    // we may build on one machine & push on another, so remove the path prefix
    const absDistPath = path.resolve(__dirname, path.relative(__dirname, absBuildPath))
    collector[`${name}${ext}`] = absDistPath
  })
  const fileStoreManager = getFileStoreManager()
  const results = await Promise.all(
    Object.entries(collector).map(async ([fileName, pathName]) => {
      // store meeting templates under our Parabol ghost organization
      const partialPath = `Organization/aGhostOrg/template/${fileName}`
      const exists = await fileStoreManager.checkExists(partialPath)
      if (exists) return false
      const buffer = await fs.promises.readFile(pathName as string)
      return fileStoreManager.putFile({partialPath, buffer})
    })
  )
  const urls = results.filter(Boolean)
  if (urls.length === 0) {
    console.log('No files pushed to CDN')
  } else {
    console.log('New files pushed to CDN:\n' + urls.join('\n'))
  }
}

pushToCDN()
