// import {WebSocketServer} from '@clusterws/cws'
import fs from 'fs'
import path from 'path'
import {Readable} from 'stream'
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

const getMetaFromStaticFolders = (fileName: string) => {
  for (let i = 0; i < staticDirectories.length; i++) {
    const directory = staticDirectories[i]
    const pathName = path.join(directory, fileName)
    try {
      const {mtime, size} = fs.statSync(pathName)
      // DEV ONLY
      const file = fs.readFileSync(pathName)
      return (staticObjects[pathName] = {mtime, size, directory, file})
      break
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
  const {mtime, size, directory, file} = meta
  const pathName = path.join(directory, fileName)
  if (file) {
    const readStream = new Readable()
    readStream.push(file)
    readStream.push(null)
    res.end(file)
    // pipeStreamOverResponse(res, readStream, size)
    return true
  }

  const readStream = fs.createReadStream(pathName)
  pipeStreamOverResponse(res, readStream, size)
  return true
}

export default serveStatic
