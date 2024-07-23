import isValidDate from 'parabol-client/utils/isValidDate'
import stringSimilarity from 'string-similarity'

export const defaultEqFn = (a: unknown, b: unknown) => {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (Array.isArray(a) && Array.isArray(b)) return JSON.stringify(a) === JSON.stringify(b)
  if (typeof a === 'object' && typeof b === 'object') return JSON.stringify(a) === JSON.stringify(b)
  return a === b
}
export const compareDateAlmostEqual = (rVal: unknown, pgVal: unknown) => {
  if (isValidDate(rVal) && isValidDate(pgVal)) {
    // Dates that are within 2 seconds of each other are considered equal
    return Math.abs(rVal.getTime() - pgVal.getTime()) < 2000
  }
  return false
}

export const compareRealNumber = (rVal: unknown, pgVal: unknown) => {
  if (typeof rVal !== 'number' || typeof pgVal !== 'number') return false
  // real numbers are 4 bytes & guarantee 6-decimal places of precision
  const answer = Math.abs(rVal - pgVal) < 1e-6
  return answer
}

export const compareRValUndefinedAs =
  (as: string | number | boolean | null | undefined) => (rVal: unknown, pgVal: unknown) => {
    const normalizedRVal = rVal === undefined ? as : rVal
    return defaultEqFn(normalizedRVal, pgVal)
  }
export const compareRValUndefinedAsNull = (rVal: unknown, pgVal: unknown) => {
  const normalizedRVal = rVal === undefined ? null : rVal
  return defaultEqFn(normalizedRVal, pgVal)
}
export const compareRValUndefinedAsFalse = (rVal: unknown, pgVal: unknown) => {
  const normalizedRVal = rVal === undefined ? false : rVal
  return normalizedRVal === pgVal
}

export const compareRValUndefinedAsZero = (rVal: unknown, pgVal: unknown) => {
  const normalizedRVal = rVal === undefined ? 0 : rVal
  return normalizedRVal === pgVal
}

export const compareRValUndefinedAsEmptyArray = (rVal: unknown, pgVal: unknown) => {
  const normalizedRVal = rVal === undefined ? [] : rVal
  return defaultEqFn(normalizedRVal, pgVal)
}

export const compareRValStringAsNumber = (rVal: unknown, pgVal: unknown) => {
  const normalizedRVal = Number(rVal)
  return defaultEqFn(normalizedRVal, pgVal)
}

export const compareRValOptionalPluckedObject =
  (pluckFields: Record<string, typeof defaultEqFn>) => (rVal: unknown, pgVal: unknown) => {
    if (!rVal && !pgVal) return true
    const rValObj = rVal || {}
    const pgValItem = pgVal || {}
    return Object.keys(pluckFields).every((prop) => {
      const eqFn = pluckFields[prop]!
      const rValItemProp = rValObj[prop as keyof typeof rValObj]
      const pgValItemProp = pgValItem[prop as keyof typeof pgValItem]
      return eqFn(rValItemProp, pgValItemProp)
    })
  }
export const compareRValOptionalPluckedArray =
  (pluckFields: Record<string, typeof defaultEqFn>) => (rVal: unknown, pgVal: unknown) => {
    const rValArray = Array.isArray(rVal) ? rVal : []
    if (!Array.isArray(pgVal) || pgVal.length !== rValArray.length) return false
    let isEqual = true
    rValArray.forEach((rValItem, idx) => {
      const isEqualItem = Object.keys(pluckFields).every((prop) => {
        const eqFn = pluckFields[prop]!
        const rValItemProp = rValItem[prop]
        const pgValItem = pgVal[idx]
        const pgValItemProp = pgValItem[prop]
        return eqFn(rValItemProp, pgValItemProp)
      })
      if (!isEqualItem) {
        isEqual = false
      }
    })
    return isEqual
  }

export const compareRValUndefinedAsNullAndTruncateRVal =
  (length: number, similarity = 1) =>
  (rVal: unknown, pgVal: unknown) => {
    const truncatedRVal = typeof rVal === 'string' ? rVal.slice(0, length) : rVal
    const normalizedRVal = truncatedRVal === undefined ? null : truncatedRVal
    if (
      typeof normalizedRVal === 'string' &&
      typeof pgVal === 'string' &&
      similarity &&
      similarity < 1
    ) {
      if (normalizedRVal === pgVal) return true
      const comparison = stringSimilarity.compareTwoStrings(normalizedRVal, pgVal)
      return comparison >= similarity
    }
    return defaultEqFn(normalizedRVal, pgVal)
  }

export const compareOptionalPlaintextContent = (rVal: unknown, pgVal: unknown) => {
  // old records don't have a plaintextContent, but we created that in new versions
  return rVal === undefined
    ? true
    : compareRValUndefinedAsNullAndTruncateRVal(2000, 0.19)(rVal, pgVal)
}
