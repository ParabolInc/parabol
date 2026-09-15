import interpolateVotingLabelTemplate from '../shared/interpolateVotingLabelTemplate'
import {SprintPokerDefaults} from '../types/constEnums'

const SENTINEL_FIELD_IDS: readonly string[] = [
  SprintPokerDefaults.SERVICE_FIELD_COMMENT,
  SprintPokerDefaults.SERVICE_FIELD_NULL
]

interface ServiceFieldRef {
  fieldId: string
}

interface ServiceFieldListingRef {
  targets: readonly string[]
  options: readonly ServiceFieldRef[]
}

/** A facilitator-authored template: the service pushes labels and the stored id is neither a sentinel nor a listed field */
export const isLabelTemplate = (
  {fieldId}: ServiceFieldRef,
  {targets, options}: ServiceFieldListingRef
) =>
  targets.includes('label') &&
  !SENTINEL_FIELD_IDS.includes(fieldId) &&
  !options.some((option) => option.fieldId === fieldId)

export const resolveServiceFieldLabel = (
  serviceField: ServiceFieldRef & {label: string},
  listing: ServiceFieldListingRef,
  finalScore: string | null | undefined
) =>
  isLabelTemplate(serviceField, listing)
    ? interpolateVotingLabelTemplate(serviceField.label, finalScore)
    : serviceField.label
