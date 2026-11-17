export const mapInBatches = async <T, R>(
  items: readonly T[],
  batchSize: number,
  fn: (item: T) => Promise<R>
) => {
  const results: R[] = []
  for (let start = 0; start < items.length; start += batchSize) {
    const batch = items.slice(start, start + batchSize)
    results.push(...(await Promise.all(batch.map(fn))))
  }
  return results
}
