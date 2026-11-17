import {expressionBuilder, sql} from 'kysely'
import getKysely from '../../postgres/getKysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows, isAnyOf} from '../reportQueries'
import {templateOf} from './templateExpressions'

const selectResponses = () =>
  getKysely()
    .selectFrom('TeamPromptResponse as r')
    .innerJoin('NewMeeting as m', 'm.id', 'r.meetingId')
    .innerJoin('User as u', 'u.id', 'r.userId')
    .leftJoin('MeetingTemplate as tpl', 'tpl.id', 'm.templateId')

// A standup has a response for each of its prompts, so a person counts once per standup however many they answered.
// A draft isn't shared until it's posted
const countStandupResponses = (query: ReportMeasureQuery) => {
  const eb = expressionBuilder(selectResponses())
  const template = templateOf(
    {
      templateId: eb.ref('m.templateId'),
      teamId: eb.ref('m.teamId'),
      scope: eb.ref('tpl.scope'),
      type: eb.ref('tpl.type'),
      name: eb.ref('tpl.name')
    },
    query.ownTeamIds
  )
  return countReportRows(query, selectResponses(), {
    where: [isAnyOf(eb.ref('m.teamId'), query.teamIds), eb('r.sharedAt', 'is not', null)],
    timestamp: eb.ref('m.createdAt'),
    dimensions: {
      TEAM: eb.ref('m.teamId'),
      USER: eb.ref('r.userId'),
      TEMPLATE: template.key
    },
    labels: {USER: eb.ref('u.preferredName'), TEMPLATE: template.label},
    value: eb.cast<number>(
      sql`count(DISTINCT (${eb.ref('r.meetingId')}, ${eb.ref('r.userId')}))`,
      'integer'
    )
  })
}

export default countStandupResponses
