/* cwd needs to be project root */
const fs = require('fs')
const webpack = require('webpack')
const config = require('./webpack/dev.clientdll.config')
const crypto = require('crypto')
const path = require('path')
const getProjectRoot = require('./webpack/utils/getProjectRoot')

const PROJECT_ROOT = getProjectRoot()
const DLL_ROOT = path.join(PROJECT_ROOT, 'dev', 'dll')
const CACHE_HASH = path.join(DLL_ROOT, 'pnpm-lock.yaml.md5')

const buildDll = async () => {
  return new Promise((resolve) => {
    let cacheHash
    try {
      cacheHash = fs.readFileSync(CACHE_HASH, 'utf8')
    } catch (e) {
      cacheHash = ''
    }
    const lockfile = fs.readFileSync(path.join(PROJECT_ROOT, 'pnpm-lock.yaml'), 'utf8')

    const hash = crypto.createHash('md5').update(lockfile).digest('hex')
    if (hash !== cacheHash) {
      if (!fs.existsSync(DLL_ROOT)) {
        fs.mkdirSync(DLL_ROOT, {recursive: true})
      }
      fs.writeFileSync(CACHE_HASH, hash)
      webpack(config, () => {
        console.log(`📘 DLL created`)
        resolve()
      })
    } else {
      console.log(`📘 Using cached DLL`)
      resolve()
    }
  })
}

if (require.main === module) {
  buildDll()
}

module.exports = buildDll
