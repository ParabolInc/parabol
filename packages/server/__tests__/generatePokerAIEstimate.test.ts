import type {GraphQLResolveInfo} from 'graphql'
import {PARABOL_AI_USER_ID} from 'parabol-client/utils/constants'
import generateUID from '../generateUID'
import type {GQLContext} from '../graphql/graphql'
import {generatePokerAIEstimate} from '../graphql/mutations/helpers/generatePokerAIEstimate'
import getPokerStory from '../graphql/mutations/helpers/getPokerStory'
import getKysely from '../postgres/getKysely'
import {selectNewMeetings} from '../postgres/select'
import getPhase from '../utils/getPhase'
import {sendPublic, signUp} from './common'

const mockCreate = jest.fn()
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({chat: {completions: {create: mockCreate}}}))
}))
jest.mock('../graphql/mutations/helpers/getPokerStory', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../utils/publish', () => ({__esModule: true, default: jest.fn()}))

const START_SPRINT_POKER = `
  mutation StartSprintPoker($teamId: ID!) {
    startSprintPoker(teamId: $teamId) {
      meetingId
    }
  }
`

const UPDATE_POKER_SCOPE = `
  mutation UpdatePokerScope($meetingId: ID!, $updates: [UpdatePokerScopeItemInput!]!) {
    updatePokerScope(meetingId: $meetingId, updates: $updates) {
      newStages {
        id
        dimensionRef {
          name
        }
      }
    }
  }
`

type Viewer = {teamId: string; userId: string; cookie: string}

const originalApiKey = process.env.OPEN_AI_API_KEY
beforeAll(() => {
  process.env.OPEN_AI_API_KEY = 'test-key'
})
afterAll(() => {
  process.env.OPEN_AI_API_KEY = originalApiKey
})
beforeEach(() => {
  mockCreate.mockReset()
  mockCreate.mockResolvedValue({
    choices: [{message: {content: '**Estimate: 5**\n\nAbout the size of the others.'}}]
  })
})

const startPokerOnGitHubIssue = async ({teamId, cookie}: Viewer) => {
  const started = await sendPublic({query: START_SPRINT_POKER, variables: {teamId}, cookie})
  const meetingId: string = started.data.startSprintPoker.meetingId
  const scoped = await sendPublic({
    query: UPDATE_POKER_SCOPE,
    variables: {
      meetingId,
      updates: [{service: 'github', serviceTaskId: 'acme/web:42', action: 'ADD'}]
    },
    cookie
  })
  const [newStage] = scoped.data.updatePokerScope.newStages
  const {phases} = await selectNewMeetings().where('id', '=', meetingId).executeTakeFirstOrThrow()
  const stage = getPhase(phases, 'ESTIMATE').stages.find(({id}) => id === newStage.id)!
  return {meetingId, stage, dimensionName: newStage.dimensionRef.name as string}
}

interface PastEstimate {
  label: string
  dimensionName: string
  daysAgo: number
  repoId?: string
  title?: string
}

const addPastEstimate = async ({userId, teamId}: Viewer, estimate: PastEstimate) => {
  const {label, dimensionName, daysAgo, repoId = 'acme/web', title} = estimate
  const issueNumber = Math.floor(Math.random() * 1_000_000) + 100
  const taskId = `${teamId}::${generateUID()}`
  const pg = getKysely()
  await pg
    .insertInto('Task')
    .values({
      id: taskId,
      content: JSON.stringify({}),
      createdBy: userId,
      plaintextContent: 'Task imported from github #archived',
      teamId,
      integrationHash: `${repoId}:${issueNumber}`,
      integration: JSON.stringify({
        service: 'github',
        accessUserId: userId,
        nameWithOwner: repoId,
        issueNumber
      })
    })
    .execute()
  await pg
    .insertInto('TaskEstimate')
    .values({
      changeSource: 'meeting',
      name: dimensionName,
      label,
      taskId,
      userId,
      createdAt: new Date(Date.now() - daysAgo * 86_400_000),
      ...(title && {
        repoId,
        storyReference: `${repoId}#${issueNumber}`,
        storyTitle: title,
        storyDescription: `${title}, as the team described it`
      })
    })
    .execute()
  return {taskId, reference: `${repoId}#${issueNumber}`}
}

const run = (
  viewer: Viewer,
  meetingId: string,
  stage: Awaited<ReturnType<typeof startPokerOnGitHubIssue>>['stage']
) =>
  generatePokerAIEstimate({
    stage,
    meetingId,
    teamId: viewer.teamId,
    context: {} as GQLContext,
    info: {} as GraphQLResolveInfo
  })

const aiComments = (discussionId: string) =>
  getKysely()
    .selectFrom('Comment')
    .select('content')
    .where('discussionId', '=', discussionId)
    .where('createdBy', '=', PARABOL_AI_USER_ID)
    .execute()

const askedPrompt = () => mockCreate.mock.calls[0][0].messages[0].content as string

test('compares a GitHub story to the team’s own stories from the same repo', async () => {
  const [viewer, otherTeam] = await Promise.all([signUp(), signUp()])
  const {meetingId, stage, dimensionName} = await startPokerOnGitHubIssue(viewer)
  jest.mocked(getPokerStory).mockResolvedValue({
    reference: 'acme/web#42',
    title: 'Login page spins forever',
    description: 'The login spinner never stops',
    repoId: 'acme/web'
  })
  const login = await addPastEstimate(viewer, {
    label: '5',
    dimensionName,
    daysAgo: 3,
    title: 'Add a login page'
  })
  const billing = await addPastEstimate(viewer, {
    label: '8',
    dimensionName,
    daysAgo: 2,
    title: 'Export billing history'
  })
  await addPastEstimate(viewer, {label: '13', dimensionName, daysAgo: 1})
  await addPastEstimate(viewer, {
    label: '3',
    dimensionName,
    daysAgo: 4,
    repoId: 'acme/api',
    title: 'Login token refresh'
  })
  await addPastEstimate(viewer, {
    label: '1',
    dimensionName: 'Value',
    daysAgo: 1,
    title: 'Login page copy'
  })
  await addPastEstimate(otherTeam, {
    label: '21',
    dimensionName,
    daysAgo: 1,
    title: 'Login page redesign'
  })

  mockCreate.mockResolvedValue({
    choices: [{message: {content: `**Estimate: 5**\n\nAbout the size of ${login.reference}.`}}]
  })

  await run(viewer, meetingId, stage)

  const prompt = askedPrompt()
  const referenceKeys = [...prompt.matchAll(/- Key: (\S+)\./g)].map(([, key]) => key)
  expect(referenceKeys).toEqual([login.reference, billing.reference])
  expect(mockCreate.mock.calls[0][0].reasoning_effort).toBe('low')
  expect(prompt).toContain(
    "How this team's 4 most recent estimates are spread: 3: 25%, 5: 25%, 8: 25%, 13: 25%."
  )
  const [comment] = await aiComments(stage.discussionId)
  expect(JSON.stringify(comment?.content)).toContain(
    `"type":"popoverMention","attrs":{"label":"${login.reference}"`
  )
})

test('a story estimated twice is one reference, at its latest vote', async () => {
  const viewer = await signUp()
  const {meetingId, stage, dimensionName} = await startPokerOnGitHubIssue(viewer)
  jest.mocked(getPokerStory).mockResolvedValue({
    reference: 'acme/web#42',
    title: 'Login page spins forever',
    description: '',
    repoId: 'acme/web'
  })
  const {taskId} = await addPastEstimate(viewer, {
    label: '3',
    dimensionName,
    daysAgo: 5,
    title: 'Add a login page'
  })
  await getKysely()
    .insertInto('TaskEstimate')
    .values({
      changeSource: 'meeting',
      name: dimensionName,
      label: '8',
      taskId,
      userId: viewer.userId,
      repoId: 'acme/web',
      storyReference: 'acme/web#7',
      storyTitle: 'Add a login page',
      storyDescription: 'Now with SSO'
    })
    .execute()

  await run(viewer, meetingId, stage)

  const prompt = askedPrompt()
  expect(prompt.match(/- Key: /g)).toHaveLength(1)
  expect(prompt).toContain('Points: (8). Description: Now with SSO')
  expect(prompt).toContain("How this team's 1 most recent estimates are spread: 8: 100%.")
})

test('posts no estimate when the team has never voted on that dimension', async () => {
  const viewer = await signUp()
  const {meetingId, stage, dimensionName} = await startPokerOnGitHubIssue(viewer)
  jest.mocked(getPokerStory).mockResolvedValue({
    reference: 'acme/web#42',
    title: 'Login page spins forever',
    description: '',
    repoId: 'acme/web'
  })
  await addPastEstimate(viewer, {label: '5', dimensionName: 'Value', daysAgo: 1, title: 'Copy'})
  expect(dimensionName).not.toBe('Value')

  await run(viewer, meetingId, stage)

  expect(mockCreate).not.toHaveBeenCalled()
  expect(await aiComments(stage.discussionId)).toEqual([])
})
