/* cwd needs to be project root */
const childProcess = require('child_process')
const fs = require('fs')
const webpack = require('webpack')
const config = require('./webpack.config.dll.js')

let cacheHash
try {
  cacheHash = fs.readFileSync('dll/yarn.md5', 'utf8')
} catch (e) {
  cacheHash = ''
}

const hash = childProcess.execSync('md5sum yarn.lock')
if (hash.toString() !== cacheHash) {
  webpack(config, () => {
    console.log('DLL created')
  })
  if (!fs.existsSync('dll')) {
    fs.mkdirSync('dll')
  }
  childProcess.exec('md5sum yarn.lock > dll/yarn.md5')
}
