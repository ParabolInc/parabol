import fs from 'fs'
import mime from 'mime-types'
import path from 'path'
import {brotliCompressSync} from 'zlib'
import isCompressible from './isCompressible'
import {Logger} from './Logger'

class StaticFileMeta {
  size: number
  pathname: string
  type: string
  file?: Buffer
  brotliFile?: Buffer
  // file is the content, if it is cached or only exists in memory
  constructor(pathname: string, file?: Buffer) {
    this.pathname = pathname
    this.size = file?.length ?? fs.statSync(pathname).size
    const ext = path.extname(pathname).slice(1)
    this.type = mime.types[ext] ?? 'application/octet-stream'
    if (file) {
      this.file = file
      if (__PRODUCTION__ && isCompressible(pathname)) {
        this.brotliFile = brotliCompressSync(file)
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
  // served from memory, in place of any file of the same name in staticPaths
  files?: {
    [filename: string]: string
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
    const {staticPaths, files = {}} = options
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
    Object.entries(files).forEach(([filename, content]) => {
      this.meta[filename] = new StaticFileMeta(filename, Buffer.from(content))
    })
  }
  getMeta(filename: string) {
    const existingMeta = this.meta[filename]
    if (existingMeta) return existingMeta
    const pathname = this.pathnames[filename]
    if (!pathname) return false
    // Caching everything, build files included. ~25MB total, not bad vs. repeated fs reads for PPMIs
    return (this.meta[filename] = new StaticFileMeta(pathname, fs.readFileSync(pathname)))
  }
}
