import {expressionBuilder, sql} from 'kysely'
import getKysely from '../../postgres/getKysely'
import type {ReportMeasureQuery} from '../reportMeasureTypes'
import {countReportRows, isAnyOf} from '../reportQueries'

const selectInvitations = () =>
  getKysely().selectFrom('TeamInvitation as i').innerJoin('User as iu', 'iu.id', 'i.invitedBy')

// Inviting someone again makes another invitation, so each person counts once per team in each step. Joining
// through an invite link makes an invitation then, from whoever made the link
const countInvitations = (query: ReportMeasureQuery) => {
  const eb = expressionBuilder(selectInvitations())
  return countReportRows(query, selectInvitations(), {
    where: [isAnyOf(eb.ref('i.teamId'), query.teamIds)],
    timestamp: eb.ref('i.createdAt'),
    dimensions: {TEAM: eb.ref('i.teamId'), USER: eb.ref('i.invitedBy')},
    labels: {USER: eb.ref('iu.preferredName')},
    value: eb.cast<number>(
      sql`count(DISTINCT (${eb.ref('i.teamId')}, lower(${eb.ref('i.email')})))`,
      'integer'
    )
  })
}

export default countInvitations
