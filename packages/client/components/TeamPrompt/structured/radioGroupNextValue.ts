const step = <T>(values: readonly T[], current: T, delta: number): T | null => {
  const idx = values.indexOf(current)
  if (idx === -1) return null
  return values[(idx + delta + values.length) % values.length] ?? null
}

const edge = <T>(values: readonly T[], key: string): T | null | undefined => {
  if (key === 'Home') return values[0] ?? null
  if (key === 'End') return values[values.length - 1] ?? null
  return undefined
}

const radioGroupNextValue = <T>(values: readonly T[], current: T, key: string): T | null => {
  const atEdge = edge(values, key)
  if (atEdge !== undefined) return atEdge
  const delta =
    key === 'ArrowRight' || key === 'ArrowDown'
      ? 1
      : key === 'ArrowLeft' || key === 'ArrowUp'
        ? -1
        : 0
  return delta ? step(values, current, delta) : null
}

export const tablistNextValue = <T>(values: readonly T[], current: T, key: string): T | null => {
  const atEdge = edge(values, key)
  if (atEdge !== undefined) return atEdge
  const delta = key === 'ArrowRight' ? 1 : key === 'ArrowLeft' ? -1 : 0
  return delta ? step(values, current, delta) : null
}

export default radioGroupNextValue
