import {sql} from 'kysely'
import getKysely from '../../../../postgres/getKysely'
import {Logger} from '../../../../utils/Logger'
import {formatWorkItemsForAI, MAX_WORK_ITEMS, type WorkItem} from './workItemsForAI'

// Gathers the viewer's own Parabol work for the AI to draft reflections from: their tasks and the
// standup responses they authored, both scoped to this team and to the drawer's date window. The
// client serializes the tab's {startAt, endAt} window as JSON into searchQuery (like GCal); we
// parse it back and pull straight from Postgres. Returns a compact text blob for the LLM, or '' if
// there's nothing.
const fetchParabolWorkItems = async (
  teamId: string,
  userId: string,
  searchQuery: string
): Promise<string> => {
  let range: {startAt?: string; endAt?: string}
  try {
    range = searchQuery ? JSON.parse(searchQuery) : {}
  } catch {
    Logger.error('fetchParabolWorkItems: could not parse searchQuery as a date range')
    return ''
  }
  const {startAt, endAt} = range
  if (!startAt || !endAt) return ''
  const start = new Date(startAt)
  const end = new Date(endAt)
  const pg = getKysely()

  const [tasks, responses] = await Promise.all([
    pg
      .selectFrom('Task')
      .select(['plaintextContent', 'status', 'updatedAt'])
      .where('userId', '=', userId)
      .where('teamId', '=', teamId)
      .where('updatedAt', '>=', start)
      .where('updatedAt', '<=', end)
      .where('plaintextContent', '!=', '')
      .where(sql<boolean>`NOT ('archived' = ANY("tags"))`)
      .orderBy('updatedAt', 'desc')
      .limit(MAX_WORK_ITEMS)
      .execute(),
    pg
      .selectFrom('TeamPromptResponse')
      .innerJoin('NewMeeting', 'NewMeeting.id', 'TeamPromptResponse.meetingId')
      .select([
        'TeamPromptResponse.plaintextContent as plaintextContent',
        'TeamPromptResponse.createdAt as createdAt',
        'NewMeeting.name as meetingName'
      ])
      .where('TeamPromptResponse.userId', '=', userId)
      .where('NewMeeting.teamId', '=', teamId)
      .where('TeamPromptResponse.createdAt', '>=', start)
      .where('TeamPromptResponse.createdAt', '<=', end)
      .where('TeamPromptResponse.plaintextContent', '!=', '')
      .orderBy('TeamPromptResponse.createdAt', 'desc')
      .limit(MAX_WORK_ITEMS)
      .execute()
  ])

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})

  const taskItems = tasks.map(
    (task): WorkItem => ({
      kind: 'Task',
      title: task.plaintextContent,
      reference: formatDate(task.updatedAt),
      url: '',
      status: task.status,
      description: null
    })
  )
  const responseItems = responses.map(
    (response): WorkItem => ({
      kind: 'Standup Response',
      title: response.meetingName ?? 'Standup',
      reference: formatDate(response.createdAt),
      url: '',
      description: response.plaintextContent
    })
  )

  return formatWorkItemsForAI([...taskItems, ...responseItems])
}

export default fetchParabolWorkItems
