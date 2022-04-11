// This is a way to emulate webpack's HMR but it actually works more reliably, but doesn't work with a single output

// import fs from 'fs'
// import util from 'util'

// const readFile = util.promisify(fs.readFile)
// const writeFile = util.promisify(fs.writeFile)
// const isReady = (watcher) => {
//   return new Promise((resolve) => {
//     watcher.on('ready', resolve)
//   })
// }

// const srcToLib = (src: string) => src.replace('/src', '/lib')
// const extensionsToWatch = ['.js', '.ts', '.tsx']

// const getWatchedModules = (watchedDirs: string[]) => {
//   const cacheKeys = Object.keys(require.cache)
//   const watchedModules = [] as NodeJS.Module[]
//   for (let i = 0; i < cacheKeys.length; i++) {
//     const key = cacheKeys[i]
//     if (!watchedDirs.some((dir) => key.startsWith(dir))) continue
//     const mod = require.cache[key]
//     if (mod.id === '.') continue
//     watchedModules.push(mod)
//   }
//   return watchedModules
// }

// // require.cache is a linked list branching down, but we need to branch up
// // so it's O(N) to determine the parents of a node to flush
// // Still faster than nuking everything & prevents loss of singletons
// const removeParents = (
//   watchedDirs: string[],
//   modulesToFlush: Set<NodeJS.Module>,
//   watchedModules: NodeJS.Module[]
// ) => {
//   const nextModulesToFlush = new Set<NodeJS.Module>()
//   modulesToFlush.forEach((mod) => {
//     delete require.cache[mod.id]
//   })

//   for (let i = 0; i < watchedModules.length; i++) {
//     const mod = watchedModules[i]
//     if (!mod) continue
//     const {children} = mod
//     // is mod a parent of a moduleToFlush? if so, flag it & its ancestors for deletion
//     for (let j = 0; j < children.length; j++) {
//       const child = children[j]
//       if (modulesToFlush.has(child)) {
//         nextModulesToFlush.add(mod)
//         break
//       }
//     }
//   }
//   if (nextModulesToFlush.size) {
//     removeParents(watchedDirs, nextModulesToFlush, watchedModules)
//   }
// }

// const hotSwap = async (srcDirs: string[]) => {
//   // lazy require since we don't use these in prod
//   const chokidar = require('chokidar')
//   const transform = require('sucrase').transform
//   const watcher = chokidar.watch(srcDirs)
//   await isReady(watcher)
//   const libDirs = srcDirs.map(srcToLib)
//   watcher.on('all', async (_event: string, srcPath: string) => {
//     if (!extensionsToWatch.some((ext) => srcPath.endsWith(ext))) {
//       console.log(`Manual Server Restart Required due to: ${srcPath}`)
//       return
//     }
//     const libPath = srcToLib(srcPath).replace(/\.\w+$/, '.js')
//     const srcCode = await readFile(srcPath, 'utf8')
//     let libCode
//     try {
//       libCode = transform(srcCode, {transforms: ['typescript', 'imports']}).code
//     } catch (e) {
//       // file was changed but code was invalid
//       return
//     }
//     const rootMod = require.cache[libPath]
//     if (rootMod) {
//       const modulesToFlush = new Set<NodeJS.Module>([rootMod])
//       const watchedModules = getWatchedModules(libDirs)
//       removeParents(libDirs, modulesToFlush, watchedModules)
//     }
//     await writeFile(libPath, libCode)
//   })
// }

// export default hotSwap
