import isValidDate from 'parabol-client/utils/isValidDate'

export const defaultEqFn = (a: unknown, b: unknown) => {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  return a === b
}
export const compareDateAlmostEqual = (rVal: unknown, pgVal: unknown) => {
  if (isValidDate(rVal) && isValidDate(pgVal)) {
    // Dates that are within 2 seconds of each other are considered equal
    return Math.abs(rVal.getTime() - pgVal.getTime()) < 2000
  }
  return false
}
export const compareRValUndefinedAsNull = (rVal: unknown, pgVal: unknown) => {
  const normalizedRVal = rVal === undefined ? null : rVal
  return defaultEqFn(normalizedRVal, pgVal)
}
export const compareRValUndefinedAsFalse = (rVal: unknown, pgVal: unknown) => {
  const normalizedRVal = rVal === undefined ? false : rVal
  return normalizedRVal === pgVal
}
