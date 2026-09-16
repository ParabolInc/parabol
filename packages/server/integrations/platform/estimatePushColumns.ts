import type {EstimatePushResult} from '../../postgres/types/EstimatePushResult'

interface EstimatePushColumns {
  pushService: NonNullable<EstimatePushResult>['service'] | null
  pushTarget: NonNullable<EstimatePushResult>['target'] | null
  pushTargetId: string | null
  jiraFieldId?: string
  githubLabelName?: string
  gitlabLabelId?: string
}

const legacyColumns = (pushResult: NonNullable<EstimatePushResult>) => {
  switch (pushResult.service) {
    case 'jira':
      return {jiraFieldId: pushResult.targetId}
    case 'github':
      return {githubLabelName: pushResult.targetId}
    case 'gitlab':
      return {gitlabLabelId: pushResult.targetId}
    default:
      return {}
  }
}

/** The TaskEstimate columns a push result writes; the three legacy columns are dual-written until the last PR of the series drops them */
export const estimatePushColumns = (pushResult: EstimatePushResult): EstimatePushColumns => {
  if (!pushResult) return {pushService: null, pushTarget: null, pushTargetId: null}
  const {service, target, targetId} = pushResult
  return {
    pushService: service,
    pushTarget: target,
    pushTargetId: targetId,
    ...legacyColumns(pushResult)
  }
}
