import RateLimiter from 'server/graphql/RateLimiter'
import RethinkDataLoader from 'server/utils/RethinkDataLoader'
import newMeetingSummaryEmailCreator from 'universal/modules/email/components/SummaryEmail/newMeetingSummaryEmailCreator'
import {sendEmailContent} from 'server/email/sendEmail'
import DataLoaderWarehouse from 'dataloader-warehouse'
import jwtDecode from 'jwt-decode'

/* Useful function to debug email layout in actual email clients. */
const JWT = 'foo'
const MEETING_ID = 'foo'
const EMAIL_ADDRESS = 'matt@parabol.co'

const authToken = jwtDecode(JWT)
const sharedDataLoader = new DataLoaderWarehouse({
  onShare: '_share',
  ttl: 1000
})
const rateLimiter = new RateLimiter()

const context = {
  dataLoader: sharedDataLoader.add(new RethinkDataLoader(authToken)),
  authToken,
  socketId: '123',
  rateLimiter
}

const resendMeetingEmailDebugger = async () => {
  const email = await newMeetingSummaryEmailCreator({meetingId: MEETING_ID, context})
  sendEmailContent(EMAIL_ADDRESS, email).catch(console.log)
}

export default resendMeetingEmailDebugger
