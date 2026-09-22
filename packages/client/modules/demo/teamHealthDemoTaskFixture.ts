import dayjs from 'dayjs'
import TeamMemberId from '../../shared/gqlIds/TeamMemberId'
import {ExternalLinks} from '../../types/constEnums'
import type {DemoJiraIssue, DemoTask} from './teamHealthDemoFixtureTypes'
import {TeamHealthDemo} from './teamHealthDemoIds'
import {DEFAULT_DEMO_TEAM_NAME} from './teamHealthDemoMeetingFixture'
import {type DemoTeammate, demoTeammateLookup} from './teamHealthDemoTeammates'
import type {DemoSeedTask, DemoTopic} from './teamHealthDemoTopics'

const {MEETING_ID, TEAM_ID} = TeamHealthDemo
const JIRA_PROJECT_KEY = 'ORB'
const JIRA_CLOUD_NAME = 'orbit-squad'

// prosemirror rejects empty text nodes, so an empty task is a paragraph with no content
export const toTaskContent = (text: string) =>
  JSON.stringify({
    type: 'doc',
    content: [{type: 'paragraph', ...(text ? {content: [{type: 'text', text}]} : {})}]
  })

const toUser = ({id, picture, preferredName}: DemoTeammate) => ({id, picture, preferredName})

const createJiraIssue = (taskId: string, issueKey: string, summary: string): DemoJiraIssue => ({
  __typename: 'JiraIssue',
  __isTaskIntegration: 'JiraIssue',
  id: `jira:${taskId}`,
  service: 'jira',
  cloudId: 'teamHealthDemoJiraCloudId',
  cloudName: JIRA_CLOUD_NAME,
  issueKey,
  projectKey: JIRA_PROJECT_KEY,
  summary,
  descriptionHTML: '',
  extraFields: [],
  url: ExternalLinks.INTEGRATIONS_JIRA
})

interface TaskInput {
  id: string
  discussionId: string
  stageId: string
  content: string
  plaintextContent: string
  status: DemoTask['status']
  author: DemoTeammate
  assignee: DemoTeammate | null
  createdAt: string
  sortOrder: number
  threadSortOrder: number
  threadParentId: string | null
  integration?: DemoJiraIssue
}

export const createDemoTask = (input: TaskInput): DemoTask => {
  const {author, assignee, integration, plaintextContent, ...rest} = input
  return {
    __typename: 'Task',
    __isThreadable: 'Task',
    ...rest,
    title: plaintextContent,
    plaintextContent,
    createdBy: author.id,
    createdByUser: toUser(author),
    updatedAt: rest.createdAt,
    dueDate: null,
    editors: [],
    error: null,
    isHighlighted: false,
    tags: [],
    integration: integration ?? null,
    integrationHash: integration ? `${JIRA_CLOUD_NAME}:${integration.issueKey}` : null,
    userId: assignee?.id ?? null,
    user: assignee ? toUser(assignee) : null,
    teamId: TEAM_ID,
    team: {id: TEAM_ID, name: DEFAULT_DEMO_TEAM_NAME, jiraDisplayFieldIds: null},
    meetingId: MEETING_ID,
    meeting: {__typename: 'TeamHealthMeeting', id: MEETING_ID, name: 'Team Health #5'},
    discussion: {
      id: rest.discussionId,
      stage: {__typename: 'TeamHealthResultStage', id: rest.stageId}
    },
    replies: []
  }
}

export const createSeedTasks = (
  topic: DemoTopic,
  discussionId: string,
  firstThreadSortOrder: number,
  createdAt: dayjs.Dayjs
) =>
  (topic.tasks ?? []).map((seed: DemoSeedTask, idx) => {
    const id = `${discussionId}_task${idx}`
    return createDemoTask({
      id,
      discussionId,
      stageId: `teamHealthDemoResultStage:${topic.id}`,
      content: toTaskContent(seed.text),
      plaintextContent: seed.text,
      status: seed.status,
      author: demoTeammateLookup[seed.author],
      assignee: demoTeammateLookup[seed.assignee],
      createdAt: createdAt.add(idx, 'minute').toISOString(),
      sortOrder: idx,
      threadSortOrder: firstThreadSortOrder + idx,
      threadParentId: null,
      integration: seed.jiraIssueKey ? createJiraIssue(id, seed.jiraIssueKey, seed.text) : undefined
    })
  })

export const demoTeamMemberId = (userId: string) => TeamMemberId.join(TEAM_ID, userId)
