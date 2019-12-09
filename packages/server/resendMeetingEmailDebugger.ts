import RateLimiter from './graphql/RateLimiter'
import RethinkDataLoader from './utils/RethinkDataLoader'
import newMeetingSummaryEmailCreator from '../client/modules/email/components/SummaryEmail/newMeetingSummaryEmailCreator'
import {sendEmailContent} from './email/sendEmail'
import jwtDecode from 'jwt-decode'

/* Useful function to debug email layout in actual email clients. */
const JWT = 'foo'
const MEETING_ID = 'foo'
const EMAIL_ADDRESS = 'matt@parabol.co'

const authToken = jwtDecode(JWT)
// const sharedDataLoader = {}
const rateLimiter = new RateLimiter()

const context = {
  ip: 'foo',
  // dataLoader: sharedDataLoader.add(new RethinkDataLoader(authToken)),
  authToken,
  socketId: '123',
  rateLimiter
}

const resendMeetingEmailDebugger = async () => {
  const email = await newMeetingSummaryEmailCreator({meetingId: MEETING_ID, context})
  sendEmailContent(EMAIL_ADDRESS, email).catch(console.log)
}

export default resendMeetingEmailDebugger
