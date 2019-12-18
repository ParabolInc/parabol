import fs from 'fs'
import mime from 'mime-types'
import path from 'path'
import {HttpResponse} from 'uWebSockets.js'
import pipeStreamOverResponse from '../pipeStreamOverResponse'
import PROD from '../PROD'

const staticObjects = {}
const PROJECT_ROOT = path.join(__dirname, '..', '..', '..')

const staticDirectories = [
  path.join(PROJECT_ROOT, 'static'),
  !PROD && path.join(PROJECT_ROOT, 'packages', 'server', 'webpack', 'dll'),
  path.join(PROJECT_ROOT, 'build')
].filter(Boolean) as string[]

const fileNamesToCache = new Set(['sw.ts', 'favicon.ico'])

const getMetaFromStaticFolders = (fileName: string) => {
  for (let i = 0; i < staticDirectories.length; i++) {
    const directory = staticDirectories[i]
    const pathName = path.join(directory, fileName)
    try {
      const {mtime, size} = fs.statSync(pathName)
      const file = !PROD || fileNamesToCache.has(fileName) ? fs.readFileSync(pathName) : undefined
      const type = mime.contentType(fileName)
      return (staticObjects[pathName] = {mtime: mtime.toUTCString(), size, directory, file, type})
    } catch (e) {
      continue
    }
  }
  return undefined
}

const serveStatic = (res: HttpResponse, fileName: string) => {
  let meta = staticObjects[fileName]
  if (!meta) {
    meta = getMetaFromStaticFolders(fileName)
    if (!meta) return false
  }
  const {mtime, size, directory, file, type} = meta

  res.writeHeader('content-type', type).writeHeader('last-modified', mtime)

  if (file) {
    res.end(file)
    return true
  }
  const pathName = path.join(directory, fileName)
  const readStream = fs.createReadStream(pathName)
  pipeStreamOverResponse(res, readStream, size)
  return true
}

export default serveStatic
