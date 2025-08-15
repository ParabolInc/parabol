import type {GraphQLResolveInfo} from 'graphql'
import {sql} from 'kysely'
import ReactDOMServer from 'react-dom/server'
import type {InternalContext} from '../graphql/graphql'
import isValid from '../graphql/isValid'
import getKysely from '../postgres/getKysely'
import getMailManager from './getMailManager'
import {makeSummaryEmailV2} from './makeSummaryEmailV2'

export const sendSummaryEmailV2 = async (
  meetingId: string,
  pageId: number,
  context: InternalContext,
  info: GraphQLResolveInfo
) => {
  const {dataLoader} = context
  const [MeetingSummaryV2, meetingMembers, meeting] = await Promise.all([
    makeSummaryEmailV2(meetingId, pageId, context, info),
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    dataLoader.get('newMeetings').loadNonNull(meetingId)
  ])
  if (!MeetingSummaryV2) return
  const rawHTML = ReactDOMServer.renderToStaticMarkup(<MeetingSummaryV2 />)
  const doctype =
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
  const html = `${doctype}${rawHTML.replace(/<!DOCTYPE.*?>/, '')}`
  const userIds = meetingMembers.map((m) => m.userId)
  const {teamId, name: meetingName} = meeting
  const [team, users] = await Promise.all([
    dataLoader.get('teams').loadNonNull(teamId),
    dataLoader.get('users').loadMany(userIds),
    getKysely()
      .updateTable('NewMeeting')
      .set({summarySentAt: sql`CURRENT_TIMESTAMP`})
      .where('id', '=', meetingId)
      .execute()
  ])
  const {orgId, name: teamName} = team
  const organization = await dataLoader.get('organizations').loadNonNull(orgId)
  const {tier, name: orgName} = organization
  const emailAddresses = users
    .filter(isValid)
    .filter(({sendSummaryEmail}) => sendSummaryEmail)
    .map(({email}) => email)

  if (!emailAddresses.length) return
  await getMailManager().sendEmail({
    to: emailAddresses,
    subject: `${teamName} ${meetingName} Summary`,
    body: `Hello, ${teamName}. Here is your ${meetingName} summary`,
    html,
    tags: [
      'type:meetingSummaryPages',
      `tier:${tier}`,
      `team:${teamName}:${orgName}:${teamId}:${orgId}`
    ]
  })
}
