/* cwd needs to be project root */
const fs = require('fs')
const webpack = require('webpack')
const config = require('./webpack.config.dll.js')
const crypto = require('crypto')

let cacheHash
try {
  cacheHash = fs.readFileSync('dll/yarn.md5', 'utf8')
} catch (e) {
  cacheHash = ''
}

const lockfile = fs.readFileSync('yarn.lock', 'utf8')

const hash = crypto
  .createHash('md5')
  .update(lockfile)
  .digest('hex')
if (hash !== cacheHash) {
  webpack(config, () => {
    console.log('DLL created')
  })
  if (!fs.existsSync('dll')) {
    fs.mkdirSync('dll')
  }
  fs.writeFileSync('dll/yarn.md5', hash)
}
