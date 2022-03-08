import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'

interface jiraWebhookPayload {
  issue: jiraIssue
  user: jiraUser
  changelog: {items: jiraIssueChangeLogItem}
  timestamp: Date
  webhookEvent: jiraWebhookEventType
  issue_event_type_name: string
}

interface jiraIssue {
  id: string
  self: string // issue url
  key: string
  fields: {
    summary: string
    created: Date
    description: string
    labels: string[]
    priority: {
      self: string
      iconUrl: string
      name: string
      id: string
    }
  }
}

interface jiraUser {
  self: string // user url
  accountId: string
  accountType: string
  avatarUrls: {
    '16x16': string
    '48x48': string
  }
  displayName: string
  active: boolean
  timeZone: string
}

interface jiraIssueChangeLogItem {
  toString: string
  to: string | null
  fromString: string
  from: string | null
  fieldtype: string // more specific? i think this is jira vs custom
  field: string // name of field altered
}

type jiraWebhookEventType =
  | 'jira:issue_created'
  | 'jira:issue_updated'
  | 'jira:issue_deleted'
  | 'comment:created'
  | 'comment_updated'
  | 'comment_deleted'
  | 'issue_property_set'
  | 'issue_property_deleted'

const jiraWebhookHandler = uWSAsyncHandler(async (res: HttpResponse, _req: HttpRequest) => {
  const event = await parseBody<jiraWebhookPayload>({res})
  res.end()

  // lookup task in parabol
  event?.issue.key
  // update task/cache
})

export default jiraWebhookHandler
