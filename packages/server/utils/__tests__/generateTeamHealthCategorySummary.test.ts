import logError from '../logError'
import OpenAIServerManager, {type TeamHealthCategorySummaryInput} from '../OpenAIServerManager'

jest.mock('../logError')

const mockCreate = jest.fn()
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({chat: {completions: {create: mockCreate}}}))
}))

const mockedLogError = logError as jest.MockedFunction<typeof logError>

const input: TeamHealthCategorySummaryInput = {
  category: 'Psychological Safety',
  question: 'If I make a mistake on this team, it is not held against me.',
  current: {
    average: 4,
    respondentCount: 6,
    answerCounts: [0, 0, 1, 4, 1],
    comments: ['Blameless write-ups after incidents have made it easier to speak up.']
  },
  previous: {
    question: 'I can raise problems and tough issues with this team.',
    average: 3.6,
    comments: []
  }
}

const reply = (content: string) => mockCreate.mockResolvedValue({choices: [{message: {content}}]})

const generate = (summaryInput: TeamHealthCategorySummaryInput = input) =>
  new OpenAIServerManager().generateTeamHealthCategorySummary(summaryInput)

const getRequest = () => mockCreate.mock.calls[0]?.[0]
const getUserPrompt = () => getRequest().messages[1].content as string

describe('generateTeamHealthCategorySummary', () => {
  const originalApiKey = process.env.OPEN_AI_API_KEY
  beforeEach(() => {
    process.env.OPEN_AI_API_KEY = 'test-key'
    reply(
      JSON.stringify({
        summary: 'The team feels safer admitting mistakes since the last check.',
        sentiment: 0.9,
        question: 'What made speaking up easier this time?'
      })
    )
  })
  afterAll(() => {
    process.env.OPEN_AI_API_KEY = originalApiKey
  })

  it('asks for JSON from a reasoning model without a temperature', async () => {
    await generate()
    const request = getRequest()
    expect(request.response_format).toEqual({type: 'json_object'})
    expect(request.reasoning_effort).toBe('low')
    expect(request).not.toHaveProperty('temperature')
    expect(request.messages[0].role).toBe('system')
  })

  it('sends this check and the previous one, including the question each asked', async () => {
    await generate()
    expect(getUserPrompt()).toContain(
      'Question this check: If I make a mistake on this team, it is not held against me.'
    )
    expect(getUserPrompt()).toContain('Average: 4.0 from 6 people')
    expect(getUserPrompt()).toContain(
      'Answers: 1 (strongly disagree): 0, 2: 0, 3: 1, 4: 4, 5 (strongly agree): 1'
    )
    expect(getUserPrompt()).toContain(
      '- Blameless write-ups after incidents have made it easier to speak up.'
    )
    expect(getUserPrompt()).toContain(
      'Previous check\nQuestion: I can raise problems and tough issues with this team.\nAverage: 3.6\nComments: none'
    )
  })

  it('leaves the spread out when the input has none, and says when there is no previous check', async () => {
    await generate({
      ...input,
      current: {...input.current, respondentCount: 3, answerCounts: null},
      previous: null
    })
    expect(getUserPrompt()).not.toContain('Answers:')
    expect(getUserPrompt()).toContain('Previous check: none')
  })

  it('returns what the model wrote', async () => {
    expect(await generate()).toEqual({
      summary: 'The team feels safer admitting mistakes since the last check.',
      sentimentScore: 0.9,
      discussionQuestion: 'What made speaking up easier this time?'
    })
  })

  it('keeps a category nobody commented on short of the bright-spot line', async () => {
    const uncommented = {...input, current: {...input.current, comments: []}}
    expect((await generate(uncommented))?.sentimentScore).toBe(0.75)
  })

  it('logs and returns nothing when the model call fails', async () => {
    mockCreate.mockRejectedValue(new Error('timeout'))
    expect(await generate()).toBe(null)
    expect(mockedLogError).toHaveBeenCalledWith(new Error('timeout'))
  })

  it('never calls the model without an API key', async () => {
    delete process.env.OPEN_AI_API_KEY
    expect(await generate()).toBe(null)
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
