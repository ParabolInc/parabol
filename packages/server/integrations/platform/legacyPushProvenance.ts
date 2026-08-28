import type {EstimatePushResult} from '../../postgres/types/EstimatePushResult'

interface LegacyPushProvenance {
  jiraFieldId?: string
  githubLabelName?: string
  gitlabLabelId?: string
}

export const legacyPushProvenance = (pushResult: EstimatePushResult): LegacyPushProvenance => {
  if (!pushResult) return {}
  switch (pushResult.service) {
    case 'jira':
      return {jiraFieldId: pushResult.fieldId}
    case 'github':
      return {githubLabelName: pushResult.labelName}
    case 'gitlab':
      return {gitlabLabelId: pushResult.labelId}
    default:
      return {}
  }
}
