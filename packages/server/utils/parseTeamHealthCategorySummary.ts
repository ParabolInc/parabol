import logError from './logError'

// TeamHealthCategorySummary.summary is a varchar(2000)
const MAX_SUMMARY_LENGTH = 2000
// the conversation starter is one short question, so anything longer is the model misbehaving
const MAX_QUESTION_LENGTH = 500

/**
 * Reads the JSON the model answers generateTeamHealthCategorySummary with. Null unless it holds a
 * summary and a numeric sentiment, which is clamped to ±sentimentLimit. The discussion question is
 * optional, so a bad one costs the conversation starter but never the summary.
 */
const parseTeamHealthCategorySummary = (content: string, sentimentLimit: number) => {
  let parsed: {summary?: unknown; sentiment?: unknown; question?: unknown} | null
  try {
    parsed = JSON.parse(content)
  } catch {
    logError(new Error('Failed to parse generateTeamHealthCategorySummary JSON response'))
    return null
  }
  const summary = typeof parsed?.summary === 'string' ? parsed.summary.trim() : ''
  const {sentiment} = parsed ?? {}
  if (!summary || summary.length > MAX_SUMMARY_LENGTH) return null
  if (typeof sentiment !== 'number' || !Number.isFinite(sentiment)) return null
  const question = typeof parsed?.question === 'string' ? parsed.question.trim() : ''
  return {
    summary,
    sentimentScore: Math.min(sentimentLimit, Math.max(-sentimentLimit, sentiment)),
    discussionQuestion: question && question.length <= MAX_QUESTION_LENGTH ? question : null
  }
}

export default parseTeamHealthCategorySummary
