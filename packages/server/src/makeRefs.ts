import path from 'path'
import PROD from './PROD'

const hotProxy = (reqPath: string) => (...args) => {
  const mod = require(reqPath).default
  return mod(...args)
}

type RefMapper<T> = {
  [K in keyof T]: any
}

const makeRefs = <T>(rootDir: string, refObj: T) => {
  const refs = {} as RefMapper<T>
  Object.keys(refObj).forEach((modName) => {
    const reqPath = refObj[modName]
    let relativeReqPath = reqPath
    if (reqPath.startsWith('.')) {
      const absPath = path.join(rootDir, reqPath)
      const absLookingRelPath = path.relative(rootDir, absPath)
      relativeReqPath = absLookingRelPath.startsWith('.')
        ? absLookingRelPath
        : `./${absLookingRelPath}`
      // } else if (reqPath.startsWith('parabol-server')) {
      // relativeReqPath = relativeReqPath.replace('parabol-server')
    }
    const value = PROD ? require(relativeReqPath).default : hotProxy(relativeReqPath)
    refs[modName] = value
  })
  return refs
}

export default makeRefs
