import jwtDecode from 'jwt-decode'
import newMeetingSummaryEmailCreator from '../client/modules/email/components/SummaryEmail/newMeetingSummaryEmailCreator'
import {sendEmailContent} from './email/sendEmail'
import RateLimiter from './graphql/RateLimiter'
import DataLoaderCache from './graphql/DataLoaderCache'
import RethinkDataLoader from './dataloader/RethinkDataLoader'

/* Useful function to debug email layout in actual email clients. */
const JWT = 'foo'
const MEETING_ID = 'foo'
const EMAIL_ADDRESS = 'matt@parabol.co'

const authToken = jwtDecode(JWT)
// const sharedDataLoader = {}
const rateLimiter = new RateLimiter()
const dataLoaderCache = new DataLoaderCache<RethinkDataLoader>()

let count = 0
const context = {
  ip: 'foo',
  dataLoader: dataLoaderCache.add(String(++count), new RethinkDataLoader()),
  authToken,
  socketId: '123',
  rateLimiter
}

const resendMeetingEmailDebugger = async () => {
  const email = await newMeetingSummaryEmailCreator({meetingId: MEETING_ID, context})
  sendEmailContent(EMAIL_ADDRESS, email, []).catch(console.log)
}

export default resendMeetingEmailDebugger
