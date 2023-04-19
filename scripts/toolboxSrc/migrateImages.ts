import fs from 'fs'
import path from 'path'
import getFileStoreManager from '../../packages/server/fileStorage/getFileStoreManager'

const migrateImages = async () => {
  const collector = {}
  const context = (require as any).context(
    '../../static/images/illustrations',
    false,
    /Template.png$/
  )
  context.keys().forEach((relativePath) => {
    const {name, ext} = path.parse(relativePath)
    collector[`${name}${ext}`] = context(relativePath).default
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

migrateImages()
