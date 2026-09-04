import JiraServerIssueId from '~/shared/gqlIds/JiraServerIssueId'
import type {JiraServerIssue as JiraServerRestIssue} from '../../../dataloader/jiraServerLoaders'
import {
  VOTE_FIELD_ALLOWED_TYPES,
  VOTE_FIELD_ID_BLACKLIST
} from '../../../integrations/jiraServer/jiraServerVoteFields'
import type {JiraServerIssueResolvers} from '../resolverTypes'

export type JiraServerIssueSource = JiraServerRestIssue & {
  userId: string
  teamId: string
  providerId: number
}

const JiraServerIssue: JiraServerIssueResolvers = {
  __isTypeOf: ({service}) => service === 'jiraServer',
  id: ({id, projectId, providerId}) => {
    return JiraServerIssueId.join(providerId, projectId, id)
  },

  url: ({issueKey, self}) => {
    const {origin} = new URL(self)
    return `${origin}/browse/${issueKey}`
  },

  service: () => 'jiraServer' as const,

  title: ({summary}) => summary,

  possibleEstimationFieldNames: async (
    {teamId, userId, providerId, issueType, projectId},
    _args,
    {dataLoader}
  ) => {
    const issueMeta = await dataLoader
      .get('jiraServerFieldTypes')
      .load({teamId, userId, projectId, issueType, providerId})
    if (!issueMeta) return []
    const fieldNames = issueMeta
      .filter(
        ({fieldId, operations, schema}) =>
          !VOTE_FIELD_ID_BLACKLIST.includes(fieldId) &&
          operations.includes('set') &&
          VOTE_FIELD_ALLOWED_TYPES.includes(schema.type)
      )
      .map(({name}) => name)
    return fieldNames
  }
}

export default JiraServerIssue
