import logError from '../logError'
import parseTeamHealthCategorySummary from '../parseTeamHealthCategorySummary'

jest.mock('../logError')

const mockedLogError = logError as jest.MockedFunction<typeof logError>

const parse = (content: unknown, sentimentLimit = 1) =>
  parseTeamHealthCategorySummary(
    typeof content === 'string' ? content : JSON.stringify(content),
    sentimentLimit
  )

describe('parseTeamHealthCategorySummary', () => {
  it('returns the trimmed summary, sentiment and discussion question', () => {
    expect(
      parse({
        summary: '  The team feels safer admitting mistakes since the last check.  ',
        sentiment: 0.55,
        question: ' What made speaking up easier this time? '
      })
    ).toEqual({
      summary: 'The team feels safer admitting mistakes since the last check.',
      sentimentScore: 0.55,
      discussionQuestion: 'What made speaking up easier this time?'
    })
  })

  it('clamps the sentiment to the limit it is given', () => {
    expect(parse({summary: 'Glowing.', sentiment: 3})?.sentimentScore).toBe(1)
    expect(parse({summary: 'Dire.', sentiment: -1.7})?.sentimentScore).toBe(-1)
    expect(parse({summary: 'Glowing.', sentiment: 0.9}, 0.75)?.sentimentScore).toBe(0.75)
    expect(parse({summary: 'Dire.', sentiment: -0.95}, 0.75)?.sentimentScore).toBe(-0.75)
    expect(parse({summary: 'Steady.', sentiment: 0.4}, 0.75)?.sentimentScore).toBe(0.4)
  })

  it('keeps the summary when the question is missing or too long to be one', () => {
    expect(parse({summary: 'Steady.', sentiment: 0.1})?.discussionQuestion).toBe(null)
    expect(
      parse({summary: 'Steady.', sentiment: 0.1, question: 'x'.repeat(501)})?.discussionQuestion
    ).toBe(null)
  })

  it.each([
    ['a sentiment that is not a number', {summary: 'Steady.', sentiment: '0.4'}],
    ['a missing sentiment', {summary: 'Steady.'}],
    ['an empty summary', {summary: '   ', sentiment: 0.2}],
    ['a summary too long to store', {summary: 'x'.repeat(2001), sentiment: 0.2}],
    ['JSON that is not an object', 'null'],
    ['a JSON array', [{summary: 'Steady.', sentiment: 0.2}]]
  ])('returns nothing for %s', (_label, content) => {
    expect(parse(content)).toBe(null)
  })

  it('logs and returns nothing when the reply is not JSON', () => {
    expect(parse('The team feels fine.')).toBe(null)
    expect(mockedLogError).toHaveBeenCalled()
  })
})
