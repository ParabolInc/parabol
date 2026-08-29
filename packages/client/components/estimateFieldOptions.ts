import interpolateVotingLabelTemplate from '../shared/interpolateVotingLabelTemplate'
import {SprintPokerDefaults} from '../types/constEnums'

export interface EstimateFieldOption {
  fieldId: string
  label: string
}

export const SENTINEL_FIELD_LABELS: Record<string, string> = {
  [SprintPokerDefaults.SERVICE_FIELD_COMMENT]: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
}

/** Static field ids a service may report even when its listDimensionFields options are empty (e.g. GitLab, Linear) */
export const STATIC_FIELD_LABELS: Record<string, string> = {
  [SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD]:
    SprintPokerDefaults.AZURE_DEVOPS_USERSTORY_FIELD_LABEL,
  [SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD]: SprintPokerDefaults.AZURE_DEVOPS_TASK_FIELD_LABEL,
  [SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_FIELD]:
    SprintPokerDefaults.AZURE_DEVOPS_REMAINING_WORK_LABEL,
  [SprintPokerDefaults.AZURE_DEVOPS_EFFORT_FIELD]: SprintPokerDefaults.AZURE_DEVOPS_EFFORT_LABEL,
  [SprintPokerDefaults.AZURE_DEVOPS_SIZE_FIELD]: SprintPokerDefaults.AZURE_DEVOPS_SIZE_LABEL,
  [SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE]:
    SprintPokerDefaults.GITLAB_FIELD_TIME_ESTIMATE_LABEL,
  [SprintPokerDefaults.GITLAB_FIELD_WEIGHT]: SprintPokerDefaults.GITLAB_FIELD_WEIGHT_LABEL,
  [SprintPokerDefaults.LINEAR_FIELD_ESTIMATE]: SprintPokerDefaults.LINEAR_FIELD_ESTIMATE_LABEL,
  [SprintPokerDefaults.LINEAR_FIELD_PRIORITY]: SprintPokerDefaults.LINEAR_FIELD_PRIORITY_LABEL
}

/** True when a stored field name is a facilitator-authored label template rather than a sentinel or a service's static field id */
export const isFieldTemplate = (name: string): boolean =>
  !SENTINEL_FIELD_LABELS[name] && !STATIC_FIELD_LABELS[name]

/** serviceField.name is the field's stored name — Jira stores the display name, other services the id */
export const findEstimateFieldOption = (options: readonly EstimateFieldOption[], name: string) =>
  options.find(({fieldId, label}) => fieldId === name || label === name)

interface EstimateFieldLabelInput {
  name: string
  options: readonly EstimateFieldOption[]
  targets: readonly string[]
  finalScore: string | null | undefined
}

export const resolveEstimateFieldLabel = ({
  name,
  options,
  targets,
  finalScore
}: EstimateFieldLabelInput) => {
  const sentinel = SENTINEL_FIELD_LABELS[name]
  if (sentinel) return sentinel
  const option = findEstimateFieldOption(options, name)
  if (option) return option.label
  const staticLabel = STATIC_FIELD_LABELS[name]
  if (staticLabel) return staticLabel
  if (targets.includes('label')) return interpolateVotingLabelTemplate(name, finalScore)
  return name
}
