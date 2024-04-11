import fs from 'fs'
import mime from 'mime-types'
import path from 'path'
import {brotliCompressSync} from 'zlib'
import {Logger} from './Logger'
import isCompressible from './isCompressible'
class StaticFileMeta {
  mtime: string
  size: number
  pathname: string
  type: string
  file?: Buffer
  brotliFile?: Buffer
  constructor(pathname: string, cacheFile?: boolean) {
    this.pathname = pathname
    const {mtime, size} = fs.statSync(pathname)
    this.mtime = mtime.toUTCString()
    this.size = size
    const ext = path.extname(pathname).slice(1)
    this.type = mime.types[ext] ?? 'application/octet-stream'
    if (cacheFile) {
      this.file = fs.readFileSync(pathname)
      if (__PRODUCTION__ && isCompressible(pathname)) {
        this.brotliFile = brotliCompressSync(this.file)
      }
    }
  }
}

interface MetaDict {
  [filename: string]: StaticFileMeta
}

interface Options {
  staticPaths: {
    [pathname: string]: boolean
  }
}

interface PathNames {
  [filename: string]: string
}

const makePathnames = (dirname: string, pathnames: PathNames, prefix: string) => {
  fs.readdirSync(dirname, {withFileTypes: true}).forEach((dirent) => {
    if (dirent.isFile()) {
      const key = prefix + dirent.name
      pathnames[key] = path.join(dirname, dirent.name)
    } else if (dirent.isDirectory()) {
      makePathnames(path.join(dirname, dirent.name), pathnames, `${prefix}${dirent.name}/`)
    }
  })
}
export default class StaticServer {
  pathnames: PathNames = {}
  meta: MetaDict = {}
  constructor(options: Options) {
    const {staticPaths} = options
    Object.keys(staticPaths).forEach((dirname) => {
      if (!staticPaths[dirname]) return
      try {
        if (!fs.existsSync(dirname)) {
          fs.mkdirSync(dirname)
        }
        makePathnames(dirname, this.pathnames, '')
      } catch (e) {
        Logger.log(e)
      }
    })
  }
  getMeta(filename: string) {
    const existingMeta = this.meta[filename]
    if (existingMeta) return existingMeta
    const pathname = this.pathnames[filename]
    if (!pathname) return false
    // Caching everything, build files included. ~25MB total, not bad vs. repeated fs reads for PPMIs
    const cacheFile = true
    return (this.meta[filename] = new StaticFileMeta(pathname, cacheFile))
  }
}
