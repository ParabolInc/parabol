import {expressionBuilder} from 'kysely'
import getKysely from '../../postgres/getKysely'
import {hasEnoughAttendees} from '../../postgres/teamActivityCriteria'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows, isAnyOf} from '../reportQueries'
import {templateOf} from './templateExpressions'
import {topicOf} from './topicExpressions'

const selectDiscussions = () =>
  getKysely()
    .selectFrom('Discussion as d')
    .innerJoin('NewMeeting as m', 'm.id', 'd.meetingId')
    .leftJoin('MeetingTemplate as tpl', 'tpl.id', 'm.templateId')
    .leftJoin('RetroReflectionGroup as rg', (join) =>
      join
        .on('d.discussionTopicType', '=', 'reflectionGroup')
        .onRef('rg.id', '=', 'd.discussionTopicId')
    )
    .leftJoin('AgendaItem as ai', (join) =>
      join.on('d.discussionTopicType', '=', 'agendaItem').onRef('ai.id', '=', 'd.discussionTopicId')
    )

const countDiscussions = (query: ReportMeasureQuery, {withTask}: {withTask: boolean}) => {
  const from = selectDiscussions()
  const eb = expressionBuilder(from)
  const template = templateOf(
    {
      templateId: eb.ref('m.templateId'),
      teamId: eb.ref('m.teamId'),
      scope: eb.ref('tpl.scope'),
      name: eb.ref('tpl.name')
    },
    query.ownTeamIds
  )
  const topic = topicOf({
    title: eb.ref('rg.title'),
    smartTitle: eb.ref('rg.smartTitle'),
    content: eb.ref('ai.content')
  })
  return countReportRows(query, from, {
    where: [
      isAnyOf(eb.ref('m.teamId'), query.teamIds),
      hasEnoughAttendees(eb.ref('m.id')),
      withTask
        ? eb.exists(
            eb
              .selectFrom('Task')
              .select(eb.lit(1).as('hasTask'))
              .whereRef('Task.discussionId', '=', 'd.id')
          )
        : eb.lit(true)
    ],
    timestamp: eb.ref('d.createdAt'),
    dimensions: {
      TEAM: eb.ref('m.teamId'),
      MEETING_TYPE: eb.cast<string>('m.meetingType', 'text'),
      TEMPLATE: template.key,
      TOPIC: topic.key
    },
    labels: {TEMPLATE: template.label, TOPIC: topic.label},
    requires: {TOPIC: topic.requires},
    value: eb.cast<number>(eb.fn.countAll(), 'integer')
  })
}

export default countDiscussions
