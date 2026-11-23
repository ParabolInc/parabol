import logError from './logError'

/**
 * Reads the JSON the model answers pickRelatedDiscussions with: the 1-based numbers of the past topics
 * it picked. Returns their 0-based indexes, deduped and capped. Null when the answer is unreadable, which
 * is a failure; an empty list is the model saying nothing is related.
 */
const parseRelatedDiscussionPicks = (content: string, pastTopicCount: number, maxPicks: number) => {
  let parsed: {related?: unknown} | null
  try {
    parsed = JSON.parse(content)
  } catch {
    logError(new Error('Failed to parse pickRelatedDiscussions JSON response'))
    return null
  }
  const related = parsed?.related
  if (!Array.isArray(related)) return null
  const indexes = related
    .map(Number)
    .filter((pick) => Number.isInteger(pick) && pick >= 1 && pick <= pastTopicCount)
    .map((pick) => pick - 1)
  return [...new Set(indexes)].slice(0, maxPicks)
}

export default parseRelatedDiscussionPicks
