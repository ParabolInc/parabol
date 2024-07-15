export const normalizeResults = <KeyT extends string | number, T extends {[key: string]: any}>(
  keys: Readonly<KeyT[]>,
  results: T[],
  key: keyof T = 'id'
) => {
  const map = {} as Record<KeyT, T>
  results.forEach((result: T) => {
    map[result[key]] = result
  })
  return keys.map((key) => map[key] as T)
}

export default normalizeResults
