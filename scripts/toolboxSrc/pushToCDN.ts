import fs from 'fs'
import getFileStoreManager from 'parabol-server/fileStorage/getFileStoreManager'
import path from 'path'

const pushClientAssetsToCDN = async () => {
  const fileStoreManager = getFileStoreManager()
  const localClientAssetsDir = path.join(__PROJECT_ROOT__, 'build')
  if (process.env.FILE_STORE_PROVIDER === 'local') {
    console.log('⛅️ Using Local File Store for client assets. Skipping...')
    return
  }

  const dirEnts = await fs.promises.readdir(localClientAssetsDir, {withFileTypes: true})
  await Promise.all(
    dirEnts.map(async (dirent) => {
      const {name} = dirent
      if (!dirent.isFile()) throw new Error(`⛅️ Expected ${name} to be a file`)
      const file = await fs.promises.readFile(path.join(localClientAssetsDir, name))
      return fileStoreManager.putBuildFile(file, name)
    })
  )
  console.log(`⛅️ Uploaded ${dirEnts.length} client assets to CDN`)
}

const pushTemplatesToCDN = async () => {
  const fileStoreManager = getFileStoreManager()
  const collector = {} as Record<string, string>
  const context = (require as any).context(
    '../../static/images/illustrations',
    false,
    /\/action.png$|\/teamPrompt.png$|Template.png$/
  )

  context.keys().forEach((relativePath: string) => {
    const {name, ext} = path.parse(relativePath)
    // This path only exists on the build machine
    const builtPath = context(relativePath).default
    // sub out the build machine path prefix with the __dirname
    // e.g. /Users/CI/dist/templates/X.png -> /app/dist/templates/X.png
    const absPath = builtPath.replace(/^.+\/dist(\/.+$)/, __dirname + '$1')
    collector[`${name}${ext}`] = absPath
  })
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

  if (urls.length > 0) {
    console.log(urls.join('\n'))
  }

  console.log(`⛅️ Uploaded ${urls.length} Meeting Templates to CDN`)
}
const pushToCDN = async () => {
  console.log('⛅️ Push to CDN Started')
  await Promise.all([pushClientAssetsToCDN(), pushTemplatesToCDN()])
  console.log('⛅️ Push to CDN Complete')
}

// If called via CLI
if (require.main === module) pushToCDN()
export default pushToCDN
