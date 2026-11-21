import OpenAIServerManager from '../OpenAIServerManager'

const mockCreate = jest.fn()
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({chat: {completions: {create: mockCreate}}}))
}))

const BRIEFING = 'FMS is the fleet management system. Dana owns billing.'
const reflection = {plaintextContent: 'FMS deploys keep failing'}

type Ask = (manager: OpenAIServerManager, teamBriefing: string | null) => Promise<unknown>

const asks: [string, Ask][] = [
  [
    'the discussion starter',
    (manager, teamBriefing) =>
      manager.getDiscussionPromptQuestion('FMS', [reflection], teamBriefing)
  ],
  [
    'a group title',
    (manager, teamBriefing) => manager.generateGroupTitle([reflection], teamBriefing)
  ],
  [
    'a retro summary',
    (manager, teamBriefing) => manager.generateSummary('topics: []', null, teamBriefing)
  ],
  [
    'a retro summary from a custom prompt',
    (manager, teamBriefing) => manager.generateSummary('topics: []', 'Be brief', teamBriefing)
  ],
  [
    'a standup summary',
    (manager, teamBriefing) =>
      manager.getStandupSummary([{content: 'Fixed FMS', user: 'Dana'}], ['Done?'], teamBriefing)
  ],
  [
    'a poker estimate',
    (manager, teamBriefing) =>
      manager.getPokerEstimate(
        [
          {issueKey: 'FMS-2', title: 'Retry deploys', description: '', storyPoints: ''},
          {issueKey: 'FMS-1', title: 'Add logging', description: '', storyPoints: '3'}
        ],
        'Story Points',
        ['1', '3', '5'],
        teamBriefing
      )
  ],
  [
    'retro drafts',
    (manager, teamBriefing) =>
      manager.generateRetroDrafts(
        '[W1] PR #12 FMS retries',
        [{question: 'What went well?', description: ''}],
        'Dana',
        3,
        null,
        teamBriefing
      )
  ],
  [
    'a standup draft',
    (manager, teamBriefing) =>
      manager.generateInspirationDraft(
        '[W1] PR #12 FMS retries',
        [{question: 'What did you do?', description: ''}],
        'Dana',
        [],
        null,
        teamBriefing
      )
  ]
]

const getUserContent = () => {
  const {messages} = mockCreate.mock.calls[0]![0] as {messages: {role: string; content: string}[]}
  return messages.find(({role}) => role === 'user')!.content
}

describe('team background', () => {
  const originalApiKey = process.env.OPEN_AI_API_KEY
  beforeEach(() => {
    process.env.OPEN_AI_API_KEY = 'test-key'
    mockCreate.mockResolvedValue({choices: [{message: {content: '{"items": []}'}}]})
  })
  afterAll(() => {
    process.env.OPEN_AI_API_KEY = originalApiKey
  })

  it.each(asks)('leads %s with the team briefing', async (_name, ask) => {
    await ask(new OpenAIServerManager(), `  ${BRIEFING}\n`)
    const content = getUserContent()
    expect(
      content.startsWith("Team background, written from this team's earlier retrospectives.")
    ).toBe(true)
    expect(content).toContain(`<team_background>\n${BRIEFING}\n</team_background>\n\n`)
    expect(content).toContain('never use it to guess who wrote something')
  })

  it.each(asks)('leaves %s alone without a briefing', async (_name, ask) => {
    await ask(new OpenAIServerManager(), null)
    expect(getUserContent()).not.toContain('team_background')
  })
})
