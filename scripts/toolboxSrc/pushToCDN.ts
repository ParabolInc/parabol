import fs from 'fs'
import getFileStoreManager from 'parabol-server/fileStorage/getFileStoreManager'
import path from 'path'
import getProjectRoot from '../webpack/utils/getProjectRoot'
;(require as any).context(
  '../../static/images/illustrations',
  false,
  /\/action.png$|\/teamPrompt.png$|Template.png$/
)

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
  const localServerAssetsDir = path.join(PROJECT_ROOT, 'dist', 'images')
  const fileStoreManager = getFileStoreManager()

  // Use this pattern if the asset is publicly available, not kept in the DB
  const defaultFileUploader = async (
    sourceDirname: string,
    filename: string,
    targetDirname: string
  ) => {
    const targetObject = `${targetDirname}${filename}`
    const exists = await fileStoreManager.checkExists(targetObject)
    if (exists) return false
    const buffer = await fs.promises.readFile(path.join(sourceDirname, filename))
    const url = await fileStoreManager.putBuildFile(buffer, targetObject)
    console.log(`⛅️ Uploaded ${url}`)
    return true
  }

  // Use this pattern if the asset is associated with a user (including aGhostUser) and the URL is kept in our DB
  const templateFileUploader = async (dirname: string, filename: string) => {
    const partialPath = `Organization/aGhostOrg/template/${filename}`
    const exists = await fileStoreManager.checkExists(partialPath)
    if (exists) return false
    const buffer = await fs.promises.readFile(path.join(dirname, filename))
    const {name, ext} = path.parse(filename)
    const url = await fileStoreManager.putTemplateIllustration(buffer, 'aGhostOrg', ext, name)
    console.log(`⛅️ Uploaded ${url}`)
    return true
  }

  const fileUploaders = {
    templates: templateFileUploader
  }

  interface NestedArray<T> extends Array<T | NestedArray<T>> {}

  const putBuildFiles = async (
    curDirname: string,
    targetDirname: string,
    fileUploader: typeof defaultFileUploader
  ): Promise<NestedArray<boolean>> => {
    const dirEnts = await fs.promises.readdir(curDirname, {withFileTypes: true})
    return Promise.all(
      dirEnts.map(async (dirent) => {
        const {name} = dirent
        if (dirent.isDirectory()) {
          const nextFileUploader =
            fileUploaders[name as keyof typeof fileUploaders] ?? defaultFileUploader
          return putBuildFiles(
            path.join(curDirname, dirent.name),
            `${targetDirname}${name}/`,
            nextFileUploader
          )
        } else if (dirent.isFile()) {
          return fileUploader(curDirname, name, targetDirname)
        } else {
          // ignore symlinks, sockets, etc.
          return false
        }
      })
    )
  }
  const totals = await putBuildFiles(localServerAssetsDir, 'images/', defaultFileUploader)
  const total = totals.flat()
  const pushed = total.filter(Boolean).length
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
