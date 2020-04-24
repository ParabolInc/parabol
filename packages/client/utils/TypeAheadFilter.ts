export default class TypeAheadFilter {
  private lastQuery = ''
  private lastResult = [] as readonly any[]

  compare(query: string, fullArray: readonly any[], getValue: (item: any) => string) {
    const arr = this.lastQuery && query.includes(this.lastQuery) ? this.lastResult : fullArray
    const scoredArray = [] as {item: any; score: number}[]
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      const value = getValue(item)
      const score = 1 / value.indexOf(query)
      if (score > 0) {
        scoredArray.push({item, score})
      }
    }
    scoredArray.sort((a, b) => {
      if (a.score === b.score) return getValue(a.item) < getValue(b.item) ? -1 : 1
      return a.score < b.score ? 1 : -1
    })
    this.lastResult = scoredArray.map(({item}) => item)
    this.lastQuery = query
    return this.lastResult
  }
}
