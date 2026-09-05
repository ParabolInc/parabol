const radioGroupNextValue = <T>(values: readonly T[], current: T, key: string): T | null => {
  if (key === 'Home') return values[0] ?? null
  if (key === 'End') return values[values.length - 1] ?? null
  const delta =
    key === 'ArrowRight' || key === 'ArrowDown'
      ? 1
      : key === 'ArrowLeft' || key === 'ArrowUp'
        ? -1
        : 0
  if (!delta) return null
  const idx = values.indexOf(current)
  if (idx === -1) return null
  return values[(idx + delta + values.length) % values.length] ?? null
}

export default radioGroupNextValue
