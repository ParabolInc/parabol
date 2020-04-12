import path from 'path'
const compressibleSet = new Set(['.ico', '.js', '.json', '.html'])

const isCompressible = (pathname: string) => {
  const ext = path.extname(pathname)
  return compressibleSet.has(ext)
}

export default isCompressible
