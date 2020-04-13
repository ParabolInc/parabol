import chokidar from 'chokidar'
import fs from 'fs'
import {transform} from 'sucrase'
import util from 'util'

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const isReady = (watcher) =>
  new Promise((resolve) => {
    watcher.on('ready', resolve)
  })

const srcToLib = (src: string) => src.replace('/src', '/lib')
const extensionsToWatch = ['.js', '.ts', '.tsx']

const hotSwap = async (srcDirs: string[]) => {
  const watcher = chokidar.watch(srcDirs)
  await isReady(watcher)
  const libDirs = srcDirs.map(srcToLib)
  watcher.on('all', async (_event: string, srcPath: string) => {
    if (!extensionsToWatch.some((ext) => srcPath.endsWith(ext))) {
      console.log(`Manual Server Restart Required due to: ${srcPath}`)
      return
    }
    const srcCode = await readFile(srcPath, 'utf8')
    let libCode
    try {
      libCode = transform(srcCode, {transforms: ['typescript', 'imports']}).code
    } catch (e) {
      // file was changed but code was invalid
      return
    }
    Object.keys(require.cache).forEach((id) => {
      if (!libDirs.some((dir) => id.startsWith(dir))) return
      delete require.cache[id]
    })
    const libPath = srcToLib(srcPath).replace(/\.\w+$/, '.js')
    await writeFile(libPath, libCode)
  })
}

export default hotSwap
