import fs from 'fs'
import path from 'path'
import getFileStoreManager from '../../packages/server/fileStorage/getFileStoreManager'
import {applyEnvVarsToClientAssets} from '../../packages/server/utils/applyEnvVarsToClientAssets'
import isContentHashed from '../../packages/server/utils/isContentHashed'
import {Logger} from '../../packages/server/utils/Logger'
import getProjectRoot from '../webpack/utils/getProjectRoot'

const PROJECT_ROOT = getProjectRoot()

// @smithy/node-http-handler has a default value of 50 maxSockets
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html
const MAX_CONCURRENT_UPLOADS = 50

// Each upload starts when another one finishes, so no upload waits for the slowest of a batch
const forEachUpload = async <T>(items: T[], upload: (item: T) => Promise<unknown>) => {
  let nextIdx = 0
  const uploadNext = async (): Promise<void> => {
    if (nextIdx >= items.length) return
    await upload(items[nextIdx++]!)
    return uploadNext()
  }
  await Promise.all(Array.from({length: MAX_CONCURRENT_UPLOADS}, uploadNext))
}

// the web server sends these to clients that accept brotli. A bucket can't, so they stay out of it
const isPrecompressed = (name: string) => name.endsWith('.br')

const pushClientAssetsToCDN = async () => {
  const fileStoreManager = getFileStoreManager()
  const localClientAssetsDir = path.join(PROJECT_ROOT, 'build')
  if (process.env.FILE_STORE_PROVIDER === 'local') {
    Logger.log('⛅️ Using Local File Store for client assets. Skipping...')
    return
  }

  const dirEnts = await fs.promises.readdir(localClientAssetsDir, {
    withFileTypes: true
  })
  // index.html, sw.js & the like are made in memory from the env vars, they are not in the build dir
  const madeFiles = new Map(Object.entries(applyEnvVarsToClientAssets()))
  const builtNames = dirEnts
    .map((dirent) => {
      if (!dirent.isFile()) throw new Error(`⛅️ Expected ${dirent.name} to be a file`)
      return dirent.name
    })
    .filter((name) => !isPrecompressed(name))
  const names = [...new Set([...builtNames, ...madeFiles.keys()])]
  let uploaded = 0
  await forEachUpload(names, async (name) => {
    const madeFile = madeFiles.get(name)
    if (madeFile === undefined && isContentHashed(name)) {
      // a content-hashed name always holds the same bytes, so a past release may have uploaded it
      if (await fileStoreManager.checkExists(name, 'build')) return
    }
    const file =
      madeFile !== undefined
        ? Buffer.from(madeFile)
        : await fs.promises.readFile(path.join(localClientAssetsDir, name))
    await fileStoreManager.putBuildFile(file, name)
    uploaded++
  })
  Logger.log(
    `⛅️ Uploaded ${uploaded} client assets to CDN, ${names.length - uploaded} were already there`
  )
}

const pushServerAssetsToCDN = async () => {
  const fileStoreManager = getFileStoreManager()
  const templatesContext = (require as any).context(
    '../../static/images/illustrations',
    false,
    /\/action.png$|\/teamPrompt.png$|Template\.(png|svg)$|teamHealth.png$/
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

  const dirEnts = (
    await fs.promises.readdir(localServerAssetsDir, {
      withFileTypes: true
    })
  ).filter((dirent) => !isPrecompressed(dirent.name))

  let pushed = 0
  await forEachUpload(dirEnts, async (dirent) => {
    const {name} = dirent
    if (!dirent.isFile()) throw new Error(`⛅️ Expected ${name} to be a file`)
    const uploader = isTemplate(name) ? templateFileUploader(name) : defaultFileUploader(name)
    const res = await uploader
    if (res === true) pushed++
  })

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
