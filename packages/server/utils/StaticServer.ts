import fs from 'fs'
import mime from 'mime-types'
import path from 'path'
import PROD from '../PROD'
import {brotliCompressSync} from 'zlib'
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
    this.type = mime.types[ext]
    if (cacheFile) {
      this.file = fs.readFileSync(pathname)
      if (PROD && isCompressible(pathname)) {
        this.brotliFile = brotliCompressSync(this.file)
      }
    }
  }
}

interface MetaDict {
  [filename: string]: StaticFileMeta
}

interface Options {
  filesToCache: string[]
  staticPaths: {
    [pathname: string]: boolean
  }
}

export default class StaticServer {
  pathnames: {
    [filename: string]: string
  } = {}
  cachedFileSet: Set<string>
  meta: MetaDict = {}
  constructor(options: Options) {
    const {filesToCache, staticPaths} = options
    this.cachedFileSet = new Set(filesToCache)
    Object.keys(staticPaths).forEach((dirname) => {
      if (!staticPaths[dirname]) return
      try {
        fs.readdirSync(dirname).forEach((filename) => {
          this.pathnames[filename] = path.join(dirname, filename)
        })
      } catch (e) {
        console.log(e)
      }
    })
  }
  getMeta(filename: string) {
    const existingMeta = this.meta[filename]
    if (existingMeta) return existingMeta
    const pathname = this.pathnames[filename]
    if (!pathname) return false
    const cacheFile = !PROD || this.cachedFileSet.has(filename)
    return (this.meta[filename] = new StaticFileMeta(pathname, cacheFile))
  }
}
