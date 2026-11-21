import logError from '../logError'
import OpenAIServerManager from '../OpenAIServerManager'

jest.mock('../logError')

const mockCreate = jest.fn()
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({chat: {completions: {create: mockCreate}}}))
}))

const pastTopics = [
  {discussedAt: new Date('2026-11-10T17:00:00Z'), text: 'Falcon cutover slipped\nWaiting on ops'},
  {discussedAt: new Date('2025-06-02T17:00:00Z'), text: 'Office snacks'},
  {discussedAt: new Date('2026-09-15T17:00:00Z'), text: 'Migration rollback plan'}
]

const reply = (content: string) => mockCreate.mockResolvedValue({choices: [{message: {content}}]})

const pick = (teamBriefing?: string | null, maxPicks = 3) =>
  new OpenAIServerManager().pickRelatedDiscussions(
    'The migration is late again',
    pastTopics,
    maxPicks,
    teamBriefing
  )

const getPrompt = () => mockCreate.mock.calls[0]?.[0].messages[0].content as string

describe('pickRelatedDiscussions', () => {
  const originalApiKey = process.env.OPEN_AI_API_KEY
  beforeEach(() => {
    process.env.OPEN_AI_API_KEY = 'test-key'
    reply(JSON.stringify({related: [3, 1]}))
  })
  afterAll(() => {
    process.env.OPEN_AI_API_KEY = originalApiKey
  })

  it('returns the picks in the order the model ranks them', async () => {
    expect(await pick()).toEqual([2, 0])
    expect(mockCreate.mock.calls[0]?.[0].response_format).toEqual({type: 'json_object'})
  })

  it('numbers each past topic and dates it, so the model can prefer recent ones', async () => {
    await pick()
    const prompt = getPrompt()
    expect(prompt).toContain('Current topic:\n"""\nThe migration is late again\n"""')
    expect(prompt).toContain(
      '[1] Discussed 2026-11-10\n"""\nFalcon cutover slipped\nWaiting on ops\n"""'
    )
    expect(prompt).toContain('[2] Discussed 2025-06-02')
    expect(prompt).toContain('Prefer recent discussions')
  })

  it('leads with the team briefing when there is one', async () => {
    await pick('Project Falcon is the database migration.')
    const prompt = getPrompt()
    expect(prompt.startsWith('Team background')).toBe(true)
    expect(prompt).toContain(
      '<team_background>\nProject Falcon is the database migration.\n</team_background>'
    )
    mockCreate.mockClear()
    await pick(null)
    expect(getPrompt()).not.toContain('team_background')
  })

  it('keeps only numbers it was shown, once each, up to the limit', async () => {
    reply(JSON.stringify({related: [0, 2, '2', 4, 1.5, 3, 1]}))
    expect(await pick(null, 2)).toEqual([1, 2])
  })

  it('tells "nothing is related" apart from a failure', async () => {
    reply(JSON.stringify({related: []}))
    expect(await pick()).toEqual([])
    reply('not json')
    expect(await pick()).toBeNull()
    expect(logError).toHaveBeenCalled()
    reply(JSON.stringify({topics: [1]}))
    expect(await pick()).toBeNull()
  })

  it('gives up without a model or anything to pick from', async () => {
    expect(
      await new OpenAIServerManager().pickRelatedDiscussions('A topic', [], 3, null)
    ).toBeNull()
    delete process.env.OPEN_AI_API_KEY
    expect(await pick()).toBeNull()
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
