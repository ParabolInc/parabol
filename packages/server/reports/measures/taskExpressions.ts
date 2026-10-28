import {expressionBuilder, sql} from 'kysely'
import {
  REPORT_NO_INTEGRATION,
  REPORT_NO_MEETING,
  REPORT_NO_USER
} from '../../../client/shared/reports/reportCatalog'
import getKysely from '../../postgres/getKysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {isAnyOf, readingSteps} from '../reportQueries'
import {templateOf} from './templateExpressions'
import {topicOf} from './topicExpressions'

// t is the task, tm the meeting it was made in, dm the meeting that archived it as done. The other joins
// name its template, owner and topic, and Postgres drops them when a report doesn't use them
export const selectTasks = () =>
  getKysely()
    .selectFrom('Task as t')
    .leftJoin('NewMeeting as tm', 'tm.id', 't.meetingId')
    .leftJoin('NewMeeting as dm', 'dm.id', 't.doneMeetingId')
    .leftJoin('MeetingTemplate as ttpl', 'ttpl.id', 'tm.templateId')
    .leftJoin('User as tu', 'tu.id', 't.userId')
    .leftJoin('Discussion as td', 'td.id', 't.discussionId')
    .leftJoin('RetroReflectionGroup as trg', (join) =>
      join
        .on('td.discussionTopicType', '=', 'reflectionGroup')
        .onRef('trg.id', '=', 'td.discussionTopicId')
    )
    .leftJoin('AgendaItem as tai', (join) =>
      join
        .on('td.discussionTopicType', '=', 'agendaItem')
        .onRef('tai.id', '=', 'td.discussionTopicId')
    )

export const selectTaskReadings = (readAt: Date[]) => selectTasks().crossJoin(readingSteps(readAt))

export const taskSource = ({teamIds, ownTeamIds}: ReportMeasureQuery) => {
  const eb = expressionBuilder(selectTasks())
  const template = templateOf(
    {
      templateId: eb.ref('tm.templateId'),
      teamId: eb.ref('tm.teamId'),
      scope: eb.ref('ttpl.scope'),
      name: eb.ref('ttpl.name')
    },
    ownTeamIds
  )
  const topic = topicOf({
    title: eb.ref('trg.title'),
    smartTitle: eb.ref('trg.smartTitle'),
    content: eb.ref('tai.content')
  })
  return {
    eb,
    isInTeams: isAnyOf(eb.ref('t.teamId'), teamIds),
    // Sprint Poker pulls each story in as a task that's archived right away
    isPokerImport: eb.fn.coalesce(
      eb.and([
        eb('tm.meetingType', '=', 'poker'),
        eb('t.integrationHash', 'is not', null),
        eb(eb.val('archived'), '=', eb.fn.any('t.tags'))
      ]),
      eb.lit(false)
    ),
    // doneAt only exists for tasks finished after it was added, so older ones fall back to the best date there is
    doneDate: eb.fn.coalesce('t.doneAt', 'dm.endedAt', 't.updatedAt'),
    breakdown: {
      dimensions: {
        TEAM: eb.ref('t.teamId'),
        USER: eb.fn.coalesce('t.userId', eb.val(REPORT_NO_USER)),
        MEETING_TYPE: eb.fn.coalesce(
          eb.cast<string | null>('tm.meetingType', 'text'),
          eb.val(REPORT_NO_MEETING)
        ),
        TEMPLATE: template.key,
        TASK_STATUS: eb.cast<string>('t.status', 'text'),
        DONE_OR_OPEN: eb.case().when('t.status', '=', 'done').then('done').else('open').end(),
        TOPIC: topic.key,
        INTEGRATION: eb.fn.coalesce(
          sql<string | null>`${eb.ref('t.integration')}->>'service'`,
          eb.val(REPORT_NO_INTEGRATION)
        )
      },
      labels: {
        USER: eb.ref('tu.preferredName'),
        TEMPLATE: template.label,
        TOPIC: topic.label
      },
      requires: {TOPIC: topic.requires}
    }
  }
}
