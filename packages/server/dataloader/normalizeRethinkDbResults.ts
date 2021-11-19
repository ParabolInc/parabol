const normalizeRethinkDbResults = <T extends {id: string}>(
  keys: Readonly<string[]>,
  results: T[]
) => {
  const map = {} as {[key: string]: T}
  results.forEach((result) => {
    map[result.id] = result
  })
  const mappedResults = [] as T[]
  keys.forEach((key) => {
    mappedResults.push(map[key])
  })
  return mappedResults
}

export default normalizeRethinkDbResults
