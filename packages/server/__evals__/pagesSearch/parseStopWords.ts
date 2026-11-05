export type StopWords = 'keep' | 'drop'

const isStopWords = (value: string): value is StopWords => value === 'keep' || value === 'drop'

const parseStopWords = (name: string, value: string) => {
  const choices = value.split(',').map((item) => {
    const trimmed = item.trim()
    if (!isStopWords(trimmed)) {
      throw new Error(`${name} must list keep and/or drop, comma-separated, got "${value}"`)
    }
    return trimmed
  })
  const duplicate = choices.find((choice, i) => choices.indexOf(choice) !== i)
  if (duplicate !== undefined) throw new Error(`${name} lists ${duplicate} more than once`)
  return choices
}

export default parseStopWords
