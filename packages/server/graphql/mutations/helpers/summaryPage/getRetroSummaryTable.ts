import type {DataLoaderInstance} from '../../../../dataloader/RootDataLoader'
import type {RetrospectiveMeeting} from '../../../../postgres/types/Meeting'
import {makeRetroMeetingInsightInput} from '../../../../utils/makeMeetingInsightInput'
import {getSummaryTable} from './getSummaryTable'

const headers = [
  'Reflection Group',
  'Votes',
  'Type',
  'Author',
  'Prompt',
  'Content',
  'Discussion Thread'
] as const

const getRetroRowData = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const meeting = (await dataLoader
    .get('newMeetings')
    .loadNonNull(meetingId)) as RetrospectiveMeeting
  const insights = await makeRetroMeetingInsightInput(meeting, dataLoader, 0, 0)
  if (!insights) return []
  const {topics} = insights
  if (topics.length === 0) return []
  const rows = [] as Record<(typeof headers)[number], string>[]

  topics.forEach((reflectionGroup) => {
    const {reflections, title, voteCount: votes, comments, tasks} = reflectionGroup
    const topicTitle = title ?? '<Untitled>'
    reflections.forEach((reflection) => {
      const {author, prompt, text} = reflection
      rows.push({
        'Reflection Group': topicTitle,
        Votes: String(votes),
        Type: 'Reflection',
        Author: author,
        Prompt: prompt,
        'Discussion Thread': '',
        Content: text
      })
    })
    tasks.forEach((task) => {
      const {author, text} = task
      rows.push({
        'Reflection Group': topicTitle,
        Votes: String(votes),
        Type: 'Task',
        Author: author,
        Prompt: '',
        'Discussion Thread': '',
        Content: text
      })
    })
    comments.forEach((comment) => {
      const {author, text: commentText, replies} = comment
      rows.push({
        'Reflection Group': topicTitle,
        Votes: String(votes),
        Type: 'Comment',
        Author: author,
        Prompt: '',
        'Discussion Thread': '',
        Content: commentText
      })
      replies?.forEach((reply) => {
        const {author, text: replyText} = reply
        rows.push({
          'Reflection Group': topicTitle,
          Votes: String(votes),
          Type: 'Reply',
          Author: author,
          Prompt: '',
          'Discussion Thread': commentText,
          Content: replyText
        })
      })
    })
  })
  return rows
}

export const getRetroSummaryTable = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const rowData = await getRetroRowData(meetingId, dataLoader)
  return getSummaryTable(headers, rowData)
}
