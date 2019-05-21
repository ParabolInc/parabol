import getRethink from 'server/database/rethinkDriver'
import {sendEmailContent} from 'server/email/sendEmail'
import newMeetingSummaryEmailCreator from 'universal/modules/email/components/SummaryEmail/newMeetingSummaryEmailCreator'
import Meeting from 'server/database/types/Meeting'
import {GQLContext} from 'server/graphql/graphql'

export default async function sendNewMeetingSummary (newMeeting: Meeting, context: GQLContext) {
  const {id: meetingId, summarySentAt} = newMeeting
  console.log('1', summarySentAt)
  if (summarySentAt) return
  console.log('2')
  const now = new Date()
  const r = getRethink()
  const res = await r
    .table('NewMeeting')
    .get(meetingId)
    .update({summarySentAt: now})
  console.log('3', res)
  const {dataLoader} = context
  const meetingMembers = await dataLoader.get('meetingMembersByMeetingId').load(meetingId)
  console.log(4, meetingMembers)
  const userIds = meetingMembers.map(({userId}) => userId)
  const users = await dataLoader.get('users').loadMany(userIds)
  console.log(5, users)
  const emailAddresses = users.map(({email}) => email)
  const emailContent = await newMeetingSummaryEmailCreator({meetingId, context})
  console.log(6, emailContent)
  return sendEmailContent(emailAddresses, emailContent)
}
