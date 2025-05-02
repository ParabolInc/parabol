import fs from 'fs'
import path from 'path'
import getFileStoreManager from '../../packages/server/fileStorage/getFileStoreManager'
import {Logger} from '../../packages/server/utils/Logger'
import getProjectRoot from '../webpack/utils/getProjectRoot'

const PROJECT_ROOT = getProjectRoot()

const chunk = (arr: any[], size: number) =>
  Array.from({length: Math.ceil(arr.length / size)}, (_, i) => arr.slice(i * size, i * size + size))

const pushClientAssetsToCDN = async () => {
  const fileStoreManager = getFileStoreManager()
  const localClientAssetsDir = path.join(PROJECT_ROOT, 'build')
  if (process.env.FILE_STORE_PROVIDER === 'local') {
    Logger.log('⛅️ Using Local File Store for client assets. Skipping...')
    return
  }

  const dirEnts = await fs.promises.readdir(localClientAssetsDir, {withFileTypes: true})
  const chunks = chunk(dirEnts, 50)
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!
    await Promise.all(
      chunk.map(async (dirent) => {
        const {name} = dirent
        if (!dirent.isFile()) throw new Error(`⛅️ Expected ${name} to be a file`)
        const file = await fs.promises.readFile(path.join(localClientAssetsDir, name))
        return fileStoreManager.putBuildFile(file, name)
      })
    )
  }
  Logger.log(`⛅️ Uploaded ${dirEnts.length} client assets to CDN`)
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
    Logger.log(`⛅️ Uploaded template ${filename} to ${url}`)
    return true
  }

  // Use this pattern if the asset is publicly available
  const defaultFileUploader = async (filename: string) => {
    // static assets in /dist/images are already hosted at /static/images
    if (process.env.FILE_STORE_PROVIDER === 'local') return
    const targetObject = `images/${filename}`
    const exists = await fileStoreManager.checkExists(targetObject, 'build')
    if (exists) return false
    const buffer = await fs.promises.readFile(path.join(localServerAssetsDir, filename))
    const url = await fileStoreManager.putBuildFile(buffer, targetObject)
    Logger.log(`⛅️ Uploaded server asset ${targetObject} to ${url}`)
    return true
  }

  const dirEnts = await fs.promises.readdir(localServerAssetsDir, {withFileTypes: true})

  // @smithy/node-http-handler has a default value of 50 maxSockets
  // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html
  const chunks = chunk(dirEnts, 50)
  let pushed = 0
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!
    await Promise.all(
      chunk.map(async (dirent) => {
        const {name} = dirent
        if (!dirent.isFile()) throw new Error(`⛅️ Expected ${name} to be a file`)
        const uploader = isTemplate(name) ? templateFileUploader(name) : defaultFileUploader(name)
        const res = await uploader
        if (res === true) pushed++
      })
    )
  }

  Logger.log(`⛅️ Server upload complete. Pushed ${pushed} assets to CDN`)
}

const pushToCDN = async () => {
  Logger.log('⛅️ Push to CDN Started')
  // Perform in serial to guarantee no more than 50 uploads at a time
  await pushClientAssetsToCDN()
  await pushServerAssetsToCDN()
  Logger.log('⛅️ Push to CDN Complete')
}

// If called via CLI
if (require.main === module) pushToCDN()
export default pushToCDN
