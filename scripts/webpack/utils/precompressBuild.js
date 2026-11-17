const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const zlib = require('zlib')

const brotliCompress = promisify(zlib.brotliCompress)

const COMPRESSIBLE = /\.(js|css|json|html|svg|ico|txt|graphql)$/

// The server sends <name>.br to clients that accept brotli, so it never compresses on the request path,
// where the best compression of one large bundle blocks the event loop for seconds
const precompressBuild = async (dirnames) => {
  const pathnames = dirnames
    .filter((dirname) => fs.existsSync(dirname))
    .flatMap((dirname) =>
      fs
        .readdirSync(dirname)
        .filter((name) => COMPRESSIBLE.test(name))
        .map((name) => path.join(dirname, name))
    )
  // zlib runs in the libuv threadpool, so these run in parallel
  await Promise.all(
    pathnames.map(async (pathname) => {
      const file = await fs.promises.readFile(pathname)
      const compressed = await brotliCompress(file, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
          [zlib.constants.BROTLI_PARAM_SIZE_HINT]: file.length
        }
      })
      // a file that barely shrinks is cheaper to send as it is
      if (compressed.length < file.length * 0.9) {
        await fs.promises.writeFile(`${pathname}.br`, compressed)
      }
    })
  )
  return pathnames.length
}

module.exports = precompressBuild
