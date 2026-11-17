const fs = require('fs')
const {transformSync} = require('@swc/core')
const {Compilation, WebpackError, sources} = require('webpack')

const PLUGIN_NAME = 'ServiceWorkerPlugin'

// The service worker is 1 file without imports, so it is transpiled by itself instead of bundled
// That keeps HMR & React Refresh out of it, so the dev server can serve the same worker that production does
// It precaches every file with a content hash in its name, except
// - images, fonts & sounds that are bigger than maxAssetSize
// - files that only the onDemandChunkGroups use
// The worker caches those when a page first asks for them
class ServiceWorkerPlugin {
  constructor(options) {
    this.options = options
  }

  getOnDemandChunkGroups(compilation) {
    const {onDemandChunkGroups = []} = this.options
    const onDemand = new Set()
    for (const name of onDemandChunkGroups) {
      const chunkGroup = compilation.namedChunkGroups.get(name)
      if (chunkGroup) {
        onDemand.add(chunkGroup)
      } else {
        compilation.warnings.push(
          new WebpackError(`${PLUGIN_NAME}: there is no chunk group named ${name}`)
        )
      }
    }
    // a group that is only loaded by on demand groups is on demand, too
    let isGrowing = onDemand.size > 0
    while (isGrowing) {
      isGrowing = false
      for (const chunkGroup of compilation.chunkGroups) {
        if (onDemand.has(chunkGroup)) continue
        const parents = chunkGroup.getParents()
        if (parents.length === 0 || !parents.every((parent) => onDemand.has(parent))) continue
        onDemand.add(chunkGroup)
        isGrowing = true
      }
    }
    return onDemand
  }

  getPrecacheManifest(compilation) {
    const {maxAssetSize} = this.options
    const onDemand = this.getOnDemandChunkGroups(compilation)
    const scriptsAndStyles = new Set()
    const precachedChunkFiles = new Set()
    const onDemandChunkFiles = new Set()
    for (const chunk of compilation.chunks) {
      const groups = [...chunk.groupsIterable]
      const isOnDemand = groups.length > 0 && groups.every((group) => onDemand.has(group))
      const chunkFiles = isOnDemand ? onDemandChunkFiles : precachedChunkFiles
      for (const filename of chunk.files) {
        scriptsAndStyles.add(filename)
        chunkFiles.add(filename)
      }
      for (const filename of chunk.auxiliaryFiles) {
        chunkFiles.add(filename)
      }
    }
    return compilation
      .getAssets()
      .filter(({name, info, source}) => {
        if (!info.immutable || info.development || info.hotModuleReplacement) return false
        if (onDemandChunkFiles.has(name) && !precachedChunkFiles.has(name)) return false
        return scriptsAndStyles.has(name) || source.size() <= maxAssetSize
      })
      .map(({name}) => name)
      .sort()
  }

  apply(compiler) {
    const {src, filename, minify, defines} = this.options
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        // content hashes are final after PROCESS_ASSETS_STAGE_OPTIMIZE_HASH
        {name: PLUGIN_NAME, stage: Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER},
        () => {
          compilation.fileDependencies.add(src)
          const manifest = this.getPrecacheManifest(compilation)
          const {code} = transformSync(fs.readFileSync(src, 'utf8'), {
            filename: src,
            swcrc: false,
            configFile: false,
            isModule: false,
            minify,
            jsc: {
              parser: {syntax: 'typescript'},
              target: 'es2022',
              minify: minify ? {compress: true, mangle: true} : undefined,
              transform: {
                optimizer: {
                  globals: {vars: {...defines, __PRECACHE_MANIFEST__: JSON.stringify(manifest)}}
                }
              }
            }
          })
          compilation.emitAsset(filename, new sources.RawSource(code))
        }
      )
    })
  }
}

module.exports = ServiceWorkerPlugin
