const DECIMAL_FRACTION = /^(?:0|1)?(?:\.\d+)?$/

const parseFractions = (name: string, value: string) => {
  const fractions = value.split(',').map((item) => {
    const trimmed = item.trim()
    const fraction = Number(trimmed)
    if (!trimmed || !DECIMAL_FRACTION.test(trimmed) || fraction > 1) {
      throw new Error(
        `${name} must list comma-separated decimals between 0 and 1, like 0.25, got "${value}"`
      )
    }
    return fraction
  })
  const duplicate = fractions.find((fraction, i) => fractions.indexOf(fraction) !== i)
  if (duplicate !== undefined) throw new Error(`${name} lists ${duplicate} more than once`)
  return fractions
}

export default parseFractions
