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
  const keptNumbers = new Set<number | null>()
  const newIndexes: number[] = []
  embeddingTexts.forEach((text, chunkIndex) => {
    const row = unclaimed.get(text)?.shift()
    if (row) keptNumbers.add(row.chunkNumber)
    else newIndexes.push(chunkIndex)
  })
  let chunkNumber = 0
  const toEmbed = newIndexes.map((chunkIndex) => {
    while (keptNumbers.has(chunkNumber)) chunkNumber++
    return {chunkIndex, chunkNumber: chunkNumber++}
  })
  return {deleteIds: [...unclaimed.values()].flat().map(({id}) => id), toEmbed}
}
