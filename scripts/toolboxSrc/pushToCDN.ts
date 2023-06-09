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
    // This path only exists on the build machine
    const builtPath = context(relativePath).default
    // sub out the build machine path prefix with the __dirname
    // e.g. /Users/CI/dist/templates/X.png -> /app/dist/templates/X.png
    const absPath = builtPath.replace(/^.+\/dist(\/.+$)/, __dirname + '$1')
    collector[`${name}${ext}`] = absPath
  })
  const fileStoreManager = getFileStoreManager()
  const results = await Promise.all(
    Object.entries(collector).map(async ([fileName, pathName]) => {
      // store meeting templates under our Parabol ghost organization
      const partialPath = `Organization/aGhostOrg/template/${fileName}`
      const exists = await fileStoreManager.checkExists(partialPath)
      if (exists) return false
      const buffer = await fs.promises.readFile(pathName as string)
      const {name, ext} = path.parse(fileName)
      return fileStoreManager.putTemplateIllustration(buffer, 'aGhostOrg', ext, name)
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
