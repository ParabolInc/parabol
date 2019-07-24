import getRethink from '../../../../database/rethinkDriver'
import {sendEmailContent} from '../../../../email/sendEmail'
import newMeetingSummaryEmailCreator from '../../../../../universal/modules/email/components/SummaryEmail/newMeetingSummaryEmailCreator'
import Meeting from '../../../../database/types/Meeting'
import {GQLContext} from '../../../graphql'

export default async function sendNewMeetingSummary (newMeeting: Meeting, context: GQLContext) {
  const {id: meetingId, summarySentAt} = newMeeting
  if (summarySentAt) return
  const now = new Date()
  const r = getRethink()
  await r
    .table('NewMeeting')
    .get(meetingId)
    .update({summarySentAt: now})
  const {dataLoader} = context
  const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  const userIds = meetingMembers.map(({userId}) => userId)
  const users = await dataLoader.get('users').loadMany(userIds)
  const emailAddresses = users.map(({email}) => email)
  const emailContent = await newMeetingSummaryEmailCreator({meetingId, context})
  return sendEmailContent(emailAddresses, emailContent)
}
