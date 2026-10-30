export interface ExistingChunk {
  id: number
  chunkNumber: number | null
  embedText: string
}

export interface ChunkReusePlan {
  deleteIds: number[]
  toEmbed: {chunkIndex: number; chunkNumber: number}[]
}

export const planChunkReuse = (
  existing: ExistingChunk[],
  embeddingTexts: string[]
): ChunkReusePlan => {
  const unclaimed = new Map<string, ExistingChunk[]>()
  for (const row of existing) {
    const rows = unclaimed.get(row.embedText)
    if (rows) rows.push(row)
    else unclaimed.set(row.embedText, [row])
  }
  const taken = new Set(existing.map(({chunkNumber}) => chunkNumber))
  const newIndexes: number[] = []
  embeddingTexts.forEach((text, chunkIndex) => {
    if (!unclaimed.get(text)?.shift()) newIndexes.push(chunkIndex)
  })
  let chunkNumber = 0
  const toEmbed = newIndexes.map((chunkIndex) => {
    while (taken.has(chunkNumber)) chunkNumber++
    return {chunkIndex, chunkNumber: chunkNumber++}
  })
  return {deleteIds: [...unclaimed.values()].flat().map(({id}) => id), toEmbed}
}
