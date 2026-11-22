import OpenAIServerManager from '../OpenAIServerManager'

const mockCreate = jest.fn()
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({chat: {completions: {create: mockCreate}}}))
}))

const originalApiKey = process.env.OPEN_AI_API_KEY
beforeAll(() => {
  process.env.OPEN_AI_API_KEY = 'test-key'
})
afterAll(() => {
  process.env.OPEN_AI_API_KEY = originalApiKey
})
beforeEach(() => {
  mockCreate.mockReset()
  mockCreate.mockResolvedValue({choices: [{message: {content: '**Estimate: 5**\n\nLike WEB-1.'}}]})
})

const LABELS = ['1', '2', '3', '5', '8', '?']
const target = {
  issueKey: 'WEB-9',
  title: 'Login spinner',
  description: 'Never stops',
  storyPoints: ''
}
const reference = {issueKey: 'WEB-1', title: 'Login page', description: 'Form', storyPoints: '5'}

const askedPrompt = () => mockCreate.mock.calls[0][0].messages[0].content as string

test('compares the story to the references and the spread of past votes', async () => {
  const estimate = await new OpenAIServerManager().getPokerEstimate(
    [target, reference],
    'Story Points',
    LABELS,
    ['5', '5', '3', '13'],
    'medium'
  )

  expect(estimate).toBe('**Estimate: 5**\n\nLike WEB-1.')
  expect(mockCreate.mock.calls[0][0].reasoning_effort).toBe('medium')
  expect(
    askedPrompt()
  ).toBe(`You are an agile estimation assistant helping a team play planning poker. Estimate the "Story Points" for the issue below.

You MUST choose exactly one value from these allowed values: 1, 2, 3, 5, 8, ?.

Issue to estimate:
Key: WEB-9. Title: Login spinner. Description: Never stops

Issues from the same project that already have an estimate, most similar first, for reference:
- Key: WEB-1. Title: Login page. Points: (5). Description: Form

How this team's 3 most recent estimates are spread: 3: 33%, 5: 67%.

Compare the scope and complexity of the issue to estimate against the reference issues, then give your estimate.

Respond in GitHub-flavored markdown. The first line MUST be exactly "**Estimate: <value>**" where <value> is the chosen allowed value. After a blank line, justify the estimate in 2-3 sentences. When you cite a reference issue, refer to it by its bare issue key only (e.g. WEB-1) — do not include its title or a link.`)
})

test('with no reference stories yet, estimates from the spread of past votes alone', async () => {
  await new OpenAIServerManager().getPokerEstimate(
    [target],
    'Story Points',
    LABELS,
    ['8', '3'],
    'low'
  )

  expect(
    askedPrompt()
  ).toBe(`You are an agile estimation assistant helping a team play planning poker. Estimate the "Story Points" for the issue below.

You MUST choose exactly one value from these allowed values: 1, 2, 3, 5, 8, ?.

Issue to estimate:
Key: WEB-9. Title: Login spinner. Description: Never stops

How this team's 2 most recent estimates are spread: 3: 50%, 8: 50%.

Judge the scope and complexity of the issue, then give your estimate.

Respond in GitHub-flavored markdown. The first line MUST be exactly "**Estimate: <value>**" where <value> is the chosen allowed value. After a blank line, justify the estimate in 2-3 sentences.`)
})

test('with no past votes on the scale, asks nothing', async () => {
  const estimate = await new OpenAIServerManager().getPokerEstimate(
    [target],
    'Story Points',
    LABELS,
    ['13', 'XL'],
    'low'
  )

  expect(estimate).toBeNull()
  expect(mockCreate).not.toHaveBeenCalled()
})
