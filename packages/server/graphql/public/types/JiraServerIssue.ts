import JiraServerIssueId from '~/shared/gqlIds/JiraServerIssueId'
import {JiraServerIssue as JiraServerRestIssue} from '../../../dataloader/jiraServerLoaders'
import {JiraServerIssueResolvers} from '../resolverTypes'

export type JiraServerIssueSource = JiraServerRestIssue & {
  userId: string
  teamId: string
  providerId: number
}

const VOTE_FIELD_ID_BLACKLIST = ['description', 'summary']
const VOTE_FIELD_ALLOWED_TYPES = ['string', 'number']

const JiraServerIssue: JiraServerIssueResolvers = {
  __isTypeOf: ({service}) => service === 'jiraServer',
  id: ({id, projectId, providerId}) => {
    return JiraServerIssueId.join(providerId, projectId, id)
  },

  url: ({issueKey, self}) => {
    const {origin} = new URL(self)
    return `${origin}/browse/${issueKey}`
  },

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
