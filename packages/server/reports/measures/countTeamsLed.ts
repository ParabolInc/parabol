import {expressionBuilder} from 'kysely'
import getKysely from '../../postgres/getKysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {groupReportRows, isAnyOf} from '../reportQueries'

const selectLeads = () =>
  getKysely().selectFrom('TeamMember as tm').innerJoin('User as u', 'u.id', 'tm.userId')

// Parabol keeps only who leads each team now, so the period doesn't change it
const countTeamsLed = (query: ReportMeasureQuery) => {
  const eb = expressionBuilder(selectLeads())
  return groupReportRows(query, selectLeads(), {
    stepIndex: eb.lit(1),
    where: [
      isAnyOf(eb.ref('tm.teamId'), query.teamIds),
      eb('tm.isLead', '=', true),
      eb('tm.isNotRemoved', '=', true)
    ],
    dimensions: {TEAM: eb.ref('tm.teamId'), USER: eb.ref('tm.userId')},
    labels: {USER: eb.ref('u.preferredName')},
    value: eb.cast<number>(eb.fn.count('tm.teamId').distinct(), 'integer')
  })
}

export default countTeamsLed
