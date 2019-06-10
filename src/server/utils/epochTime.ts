export const fromEpochSeconds = (val: number | string) => {
  const int = typeof val === 'string' ? Number.parseFloat(val) : val
  return new Date(int * 1000)
}

export const toEpochSeconds = (maybeDate: Date | number) => {
  const msFromEpoch = maybeDate instanceof Date ? maybeDate.getTime() : maybeDate
  return Math.floor(msFromEpoch / 1000)
}
