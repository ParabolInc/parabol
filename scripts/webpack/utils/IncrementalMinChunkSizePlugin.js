const {OptimizationStages} = require('webpack')

const PLUGIN_NAME = 'IncrementalMinChunkSizePlugin'

// webpack's MinChunkSizePlugin merges 1 pair of chunks per pass & recomputes the integrated size of every pair on every pass
// That is O(merges * chunks^2 * modules), which cost ~8 seconds for our ~250 chunks
// This picks the exact same merges in the exact same order, but only recomputes pairs that include a chunk that changed
// The chunks of unmergedChunkGroups are left alone, so the groups a first-time visitor loads never carry modules from unrelated routes
class IncrementalMinChunkSizePlugin {
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    const {unmergedChunkGroups = [], ...options} = this.options
    const isUnmerged = (chunk) => {
      for (const chunkGroup of chunk.groupsIterable) {
        if (unmergedChunkGroups.includes(chunkGroup.name)) return true
      }
      return false
    }
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      const fingerprints = new WeakMap()
      const integratedSizesByChunk = new WeakMap()
      compilation.hooks.optimizeChunks.tap(
        {name: PLUGIN_NAME, stage: OptimizationStages.STAGE_ADVANCED},
        (chunks) => {
          const {chunkGraph} = compilation
          const equalOptions = {chunkOverhead: 1, entryChunkMultiplicator: 1}
          const chunkSizes = new Map()
          const changedChunks = new Set()
          const smallChunks = []
          const visitedChunks = []
          let bestPair
          let bestSavedSize = 0
          let bestIntegratedSize = 0

          const getIntegratedSize = (earlierChunk, laterChunk) => {
            let integratedSizes = integratedSizesByChunk.get(earlierChunk)
            if (!integratedSizes) {
              integratedSizes = new Map()
              integratedSizesByChunk.set(earlierChunk, integratedSizes)
            }
            const isStale = changedChunks.has(earlierChunk) || changedChunks.has(laterChunk)
            let integratedSize = isStale ? undefined : integratedSizes.get(laterChunk)
            if (integratedSize === undefined) {
              integratedSize = chunkGraph.getIntegratedChunksSize(earlierChunk, laterChunk, options)
              integratedSizes.set(laterChunk, integratedSize)
            }
            return integratedSize
          }

          for (const chunk of chunks) {
            if (isUnmerged(chunk)) continue
            const fingerprint = `${chunkGraph.getNumberOfChunkModules(chunk)}:${chunkGraph.getChunkModulesSize(chunk)}:${chunk.canBeInitial()}`
            if (fingerprints.get(chunk) !== fingerprint) {
              fingerprints.set(chunk, fingerprint)
              changedChunks.add(chunk)
            }
            const chunkSize = chunkGraph.getChunkSize(chunk, options)
            chunkSizes.set(chunk, chunkSize)
            const isSmall = chunkGraph.getChunkSize(chunk, equalOptions) < options.minChunkSize
            const candidates = isSmall ? visitedChunks : smallChunks
            for (const candidate of candidates) {
              if (!chunkGraph.canChunksBeIntegrated(candidate, chunk)) continue
              const integratedSize = getIntegratedSize(candidate, chunk)
              const savedSize = chunkSizes.get(candidate) + chunkSize - integratedSize
              // strict comparisons keep the first of equals, matching the stable sort in MinChunkSizePlugin
              const isBetter =
                !bestPair ||
                savedSize > bestSavedSize ||
                (savedSize === bestSavedSize && integratedSize < bestIntegratedSize)
              if (!isBetter) continue
              bestPair = [candidate, chunk]
              bestSavedSize = savedSize
              bestIntegratedSize = integratedSize
            }
            if (isSmall) smallChunks.push(chunk)
            visitedChunks.push(chunk)
          }

          if (!bestPair) return
          const [keptChunk, mergedChunk] = bestPair
          chunkGraph.integrateChunks(keptChunk, mergedChunk)
          compilation.chunks.delete(mergedChunk)
          return true
        }
      )
    })
  }
}

module.exports = IncrementalMinChunkSizePlugin
