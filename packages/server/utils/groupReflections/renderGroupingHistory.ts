export type GroupingHistoryGroup = {
  title: string
  votes: number
  cards: {prompt: string; text: string}[]
  discussionSummary: string | null
  comments: {author: string; text: string}[]
  tasks: {owner: string | null; text: string}[]
}

export type GroupingHistoryMeeting = {
  name: string
  endedAt: Date
  groups: GroupingHistoryGroup[]
}

const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim()

const renderMeeting = ({name, endedAt, groups}: GroupingHistoryMeeting) => {
  const lines = [`## Retrospective "${oneLine(name)}" (${endedAt.toISOString().slice(0, 10)})`]
  const byVotes = groups.filter(({cards}) => cards.length > 0).sort((a, b) => b.votes - a.votes)
  for (const {title, votes, cards, discussionSummary, comments, tasks} of byVotes) {
    const header = cards.length > 1 || title ? `Group "${oneLine(title)}"` : 'Single card'
    lines.push(`${header}${votes ? `, ${votes} votes` : ''}:`)
    for (const {prompt, text} of cards) lines.push(`  - (${oneLine(prompt)}) ${oneLine(text)}`)
    if (discussionSummary) lines.push(`  Discussion summary: ${oneLine(discussionSummary)}`)
    for (const {author, text} of comments) lines.push(`  Comment by ${author}: ${oneLine(text)}`)
    for (const {owner, text} of tasks) {
      lines.push(`  Task${owner ? ` for ${owner}` : ''}: ${oneLine(text)}`)
    }
  }
  return lines.join('\n')
}

/**
 * A team's past retrospectives, oldest first, as the briefing writer reads them. Never includes who
 * wrote a card. When the whole history is longer than maxChars, the oldest retrospectives go first.
 */
const renderGroupingHistory = (meetings: GroupingHistoryMeeting[], maxChars: number) => {
  const blocks = meetings.map(renderMeeting)
  let length = blocks.reduce((sum, block) => sum + block.length + 2, 0)
  while (blocks.length > 1 && length > maxChars) length -= blocks.shift()!.length + 2
  return blocks.join('\n\n')
}

export default renderGroupingHistory
