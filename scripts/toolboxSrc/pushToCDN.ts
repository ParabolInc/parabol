import fs from 'fs'
import getFileStoreManager from 'parabol-server/fileStorage/getFileStoreManager'
import path from 'path'
import getProjectRoot from '../webpack/utils/getProjectRoot'

const PROJECT_ROOT = getProjectRoot()

const pushClientAssetsToCDN = async () => {
  const fileStoreManager = getFileStoreManager()
  const localClientAssetsDir = path.join(PROJECT_ROOT, 'build')
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

const pushServerAssetsToCDN = async () => {
  const fileStoreManager = getFileStoreManager()
  const templatesContext = (require as any).context(
    '../../static/images/illustrations',
    false,
    /\/action.png$|\/teamPrompt.png$|Template.png$/
  )
  const templatePaths = new Set<string>()
  templatesContext.keys().forEach((relativePath: `./${string}`) => {
    const {base} = path.parse(relativePath)
    templatePaths.add(base)
  })
  const isTemplate = (filename: string) => templatePaths.has(filename)

  const localServerAssetsDir = path.join(PROJECT_ROOT, 'dist', 'images')

  // Use this pattern if this is a user asset (including aGhostUser) & kept in the DB
  const templateFileUploader = async (filename: string) => {
    const partialPath = `Organization/aGhostOrg/template/${filename}`
    const exists = await fileStoreManager.checkExists(partialPath)
    if (exists) return false
    const buffer = await fs.promises.readFile(path.join(localServerAssetsDir, filename))
    const {name, ext} = path.parse(filename)
    const url = await fileStoreManager.putTemplateIllustration(buffer, 'aGhostOrg', ext, name)
    console.log(`⛅️ Uploaded template ${filename} to ${url}`)
    return true
  }

  // Use this pattern if the asset is publicly available
  const defaultFileUploader = async (filename: string) => {
    // static assets in /dist/images are already hosted at /static/images
    if (process.env.FILE_STORE_PROVIDER === 'local') return
    const targetObject = `images/${filename}`
    const exists = await fileStoreManager.checkExists(targetObject)
    if (exists) return false
    const buffer = await fs.promises.readFile(path.join(localServerAssetsDir, filename))
    const url = await fileStoreManager.putBuildFile(buffer, targetObject)
    console.log(`⛅️ Uploaded server asset ${targetObject} to ${url}`)
    return true
  }

  const dirEnts = await fs.promises.readdir(localServerAssetsDir, {withFileTypes: true})
  const entries = await Promise.all(
    dirEnts.map(async (dirent) => {
      const {name} = dirent
      if (!dirent.isFile()) throw new Error(`⛅️ Expected ${name} to be a file`)
      return isTemplate(name) ? templateFileUploader(name) : defaultFileUploader(name)
    })
  )

  const pushed = entries.filter(Boolean).length
  console.log(`⛅️ Server upload complete. Pushed ${pushed} assets to CDN`)
}

const pushToCDN = async () => {
  console.log('⛅️ Push to CDN Started')
  await Promise.all([pushClientAssetsToCDN(), pushServerAssetsToCDN()])
  console.log('⛅️ Push to CDN Complete')
}

// If called via CLI
if (require.main === module) pushToCDN()
export default pushToCDN
