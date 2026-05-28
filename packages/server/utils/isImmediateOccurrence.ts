import type {RRuleSet} from 'rrule-rust'
import {getNextRRuleDate} from './getNextRRuleDate'

// Tolerance protects against form-submission landing a few seconds after the first occurrence.
const DEFAULT_TOLERANCE_MS = 60_000

export const isImmediateOccurrence = (
  rrule: RRuleSet,
  now: Date = new Date(),
  toleranceMs: number = DEFAULT_TOLERANCE_MS
) => {
  const nextRRuleDate = getNextRRuleDate(rrule)
  if (!nextRRuleDate) return false
  return nextRRuleDate.getTime() - now.getTime() <= toleranceMs
}
