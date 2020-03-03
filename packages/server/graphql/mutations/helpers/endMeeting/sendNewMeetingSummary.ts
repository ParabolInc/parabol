import getRethink from '../../../../database/rethinkDriver'
import {sendEmailContent} from '../../../../email/sendEmail'
import newMeetingSummaryEmailCreator from '../../../../../client/modules/email/components/SummaryEmail/newMeetingSummaryEmailCreator'
import Meeting from '../../../../database/types/Meeting'
import {GQLContext} from '../../../graphql'

export default async function sendNewMeetingSummary(newMeeting: Meeting, context: GQLContext) {
  const {id: meetingId, teamId, summarySentAt} = newMeeting
  if (summarySentAt) return
  const now = new Date()
  const r = await getRethink()
  await r
    .table('NewMeeting')
    .get(meetingId)
    .update({summarySentAt: now})
    .run()
  const {dataLoader} = context
  const [meetingMembers, team] = await Promise.all([
    dataLoader.get('meetingMembersByMeetingId').load(meetingId),
    dataLoader.get('teams').load(teamId)
  ])
  const {name: teamName, orgId} = team
  const userIds = meetingMembers.map(({userId}) => userId)
  const [users, organization] = await Promise.all([
    dataLoader.get('users').loadMany(userIds),
    dataLoader.get('organizations').load(orgId)
  ])
  const {tier, name: orgName} = organization
  const emailAddresses = users.map(({email}) => email)
  const emailContent = await newMeetingSummaryEmailCreator({meetingId, context})
  return sendEmailContent(emailAddresses, emailContent, [
    'meetingSummary',
    tier,
    `${teamName}:${orgName}:${teamId}:${orgId}`
  ])
}
