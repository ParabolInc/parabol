import path from 'path'
import PROD from './PROD'

const hotProxy = (reqPath: string) => (...args) => {
  const mod = require(reqPath).default
  return mod(...args)
}

type RefMapper<T> = {
  [K in keyof T]: any
}

const makeLiveReloadable = <T>(rootDir: string, refObj: T) => {
  const refs = {} as RefMapper<T>
  Object.keys(refObj).forEach((modName) => {
    const reqPath = refObj[modName]
    let relativeReqPath = reqPath
    if (reqPath.startsWith('.')) {
      const absPath = path.join(rootDir, reqPath)
      const absLookingRelPath = path.relative(rootDir, absPath)
      // path.relative won't prefix with ./ for modules in the same dir
      relativeReqPath = absLookingRelPath.startsWith('.')
        ? absLookingRelPath
        : `./${absLookingRelPath}`
    }
    const value = PROD ? require(relativeReqPath).default : hotProxy(relativeReqPath)
    refs[modName] = value
  })
  return refs
}

export default makeLiveReloadable
