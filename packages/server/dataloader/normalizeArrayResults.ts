/**
 * Normalize results with a one to many mapping for the keys, so the key is usually a foreign key
 */
export const normalizeArrayResults = <KeyT extends string | number, T extends {[key: string]: any}>(
  keys: Readonly<KeyT[]>,
  results: T[],
  key: keyof T
) => {
  const map = {} as Record<KeyT, T[]>
  results.forEach((result: T) => {
    if (!map[result[key]]) {
      map[result[key]] = [] as T[]
    }
    map[result[key]].push(result)
  })
  const mappedResults = [] as T[][]
  keys.forEach((key) => {
    mappedResults.push(map[key])
  })
  return mappedResults
}

export default normalizeArrayResults
