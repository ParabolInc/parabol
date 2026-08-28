import type {AnyTaskIntegration} from '../../../client/shared/types/TaskIntegration'
import type {EstimatePushResult} from '../../postgres/types/EstimatePushResult'

interface LegacyPushProvenance {
  jiraFieldId?: string
  githubLabelName?: string
  gitlabLabelId?: string
}

export const legacyPushProvenance = (
  service: AnyTaskIntegration['service'],
  pushResult: EstimatePushResult
): LegacyPushProvenance => {
  if (!pushResult) return {}
  if (service === 'jira' && pushResult.targetKind === 'field') {
    return {jiraFieldId: pushResult.fieldId}
  }
  if (service === 'github' && pushResult.targetKind === 'label' && 'labelName' in pushResult) {
    return {githubLabelName: pushResult.labelName}
  }
  if (service === 'gitlab' && pushResult.targetKind === 'label' && 'labelId' in pushResult) {
    return {gitlabLabelId: pushResult.labelId}
  }
  return {}
}
