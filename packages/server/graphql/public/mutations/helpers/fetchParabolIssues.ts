import {sql} from 'kysely'
import TeamPromptResponseId from '../../../../../client/shared/gqlIds/TeamPromptResponseId'
import makeAppURL from '../../../../../client/utils/makeAppURL'
import appOrigin from '../../../../appOrigin'
import {
  compareNewestFirst,
  type InspirationIssue,
  type IssuePage
} from '../../../../integrations/platform/InspirationIssue'
import getKysely from '../../../../postgres/getKysely'
import {Logger} from '../../../../utils/Logger'

const LIST_MARKER = /^\s*(?:[-*•]|\d+[.)])\s+/

// An answer's first line says what it is about, so it names the response; the rest stays its description
const toResponseTitle = (plaintext: string) =>
  plaintext
    .split('\n')
    .map((line) => line.replace(LIST_MARKER, '').trim())
    .find(Boolean) ?? ''

type ParabolWorkKind = 'tasks' | 'standups'

// Gathers the viewer's own Parabol work for the AI to draft reflections from: their tasks and the
// standup responses they authored, both scoped to this team and to the drawer's date window. The
// client serializes the {startAt, endAt} window, plus which of tasks and standups to include, as
// JSON into searchQuery (like GCal); we parse it back and pull straight from Postgres. Returns the
// normalized issues, or [] if there's nothing.
const fetchParabolIssues = async (
  teamId: string,
  userId: string,
  searchQuery: string,
  {before, first}: IssuePage
): Promise<InspirationIssue[]> => {
  let range: {startAt?: string; endAt?: string; include?: ParabolWorkKind[]}
  try {
    range = searchQuery ? JSON.parse(searchQuery) : {}
  } catch {
    Logger.error('fetchParabolIssues: could not parse searchQuery as a date range')
    return []
  }
  const {startAt, endAt, include = ['tasks', 'standups']} = range
  if (!startAt || !endAt || include.length === 0) return []
  const start = new Date(startAt)
  const end = before && before < new Date(endAt) ? before : new Date(endAt)
  const pg = getKysely()

  const [tasks, responses] = await Promise.all([
    include.includes('tasks')
      ? pg
          .selectFrom('Task')
          .select(['plaintextContent', 'status', 'updatedAt'])
          .where('userId', '=', userId)
          .where('teamId', '=', teamId)
          .where('updatedAt', '>=', start)
          .where('updatedAt', '<=', end)
          .where('plaintextContent', '!=', '')
          .where(sql<boolean>`NOT ('archived' = ANY("tags"))`)
          .orderBy('updatedAt', 'desc')
          .limit(first)
          .execute()
      : [],
    include.includes('standups')
      ? pg
          .selectFrom('TeamPromptResponse')
          .innerJoin('NewMeeting', 'NewMeeting.id', 'TeamPromptResponse.meetingId')
          .select([
            'TeamPromptResponse.id as id',
            'TeamPromptResponse.meetingId as meetingId',
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
          .limit(first)
          .execute()
      : []
  ])

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})

  const taskItems = tasks.map(
    (task): InspirationIssue => ({
      kind: 'Task',
      title: task.plaintextContent,
      reference: formatDate(task.updatedAt),
      url: '',
      updatedAt: task.updatedAt,
      status: task.status,
      description: null,
      isOwnWork: true,
      isClosed: task.status === 'done'
    })
  )
  const responseItems = responses.map(
    (response): InspirationIssue => ({
      kind: 'Standup Response',
      title: toResponseTitle(response.plaintextContent) || (response.meetingName ?? 'Standup'),
      reference: [response.meetingName, formatDate(response.createdAt)].filter(Boolean).join(', '),
      url: makeAppURL(appOrigin, `/meet/${response.meetingId}/responses`, {
        searchParams: {responseId: TeamPromptResponseId.join(response.id)}
      }),
      updatedAt: response.createdAt,
      description: response.plaintextContent,
      isOwnWork: true
    })
  )

  return [...taskItems, ...responseItems].sort(compareNewestFirst).slice(0, first)
}

export default fetchParabolIssues
