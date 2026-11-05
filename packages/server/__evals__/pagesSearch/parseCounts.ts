const WHOLE_NUMBER = /^\d+$/

const parseCounts = (name: string, value: string) => {
  const counts = value.split(',').map((item) => {
    const trimmed = item.trim()
    if (!WHOLE_NUMBER.test(trimmed)) {
      throw new Error(`${name} must list comma-separated whole numbers, like 100, got "${value}"`)
    }
    return Number(trimmed)
  })
  const duplicate = counts.find((count, i) => counts.indexOf(count) !== i)
  if (duplicate !== undefined) throw new Error(`${name} lists ${duplicate} more than once`)
  return counts
}

export default parseCounts
