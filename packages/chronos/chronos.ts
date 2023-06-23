//
//  Cron syntax:
//
//      * * * * * *
//      | | | | | |
//      | | | | | +-- Day of the Week   (range: 0-6, 0 standing for Sunday)
//      | | | | +---- Month of the Year (range: 0-11)
//      | | | +------ Day of the Month  (range: 1-31)
//      | | +-------- Hours             (range: 0-23)
//      | +---------- Minutes           (range: 0-59)
//      +------------ Seconds           (range: 0-59)
//
// You can use:
//   Asterisks: all
//      Ranges: e.g. 1-3,5
//      Steps: e.g. */2

import {CronJob} from 'cron'
import getGraphQLExecutor from 'parabol-server/utils/getGraphQLExecutor'
import publishWebhookGQL from 'parabol-server/utils/publishWebhookGQL'

const chronos = () => {
  const {CHRONOS_PULSE_EMAIL, CHRONOS_PULSE_CHANNEL, SERVER_ID} = process.env
  if (!SERVER_ID) throw new Error('Missing Env Var: SERVER_ID')
  const canPulse = !!CHRONOS_PULSE_EMAIL && !!CHRONOS_PULSE_CHANNEL
  const timeZone = 'America/New_York'

  // listen to responses
  getGraphQLExecutor().subscribe()

  new CronJob({
    cronTime: '0 0 0 * * *' /* at 12:00am */,
    start: canPulse,
    timeZone,
    onTick() {
      const query = `query DailyPulse($after: DateTime!, $email: String!, $channelId: ID!) { dailyPulse(after: $after, email: $email, channelId: $channelId)}`
      const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24).toJSON()
      const variables = {
        after: yesterday,
        email: CHRONOS_PULSE_EMAIL,
        channelId: CHRONOS_PULSE_CHANNEL
      }
      publishWebhookGQL(query, variables)
    }
  })

  new CronJob({
    cronTime: '0 0 0 * * 1' /* at 12:00am on Monday */,
    start: canPulse,
    timeZone,
    onTick() {
      const query = `query WeeklyPulse($after: DateTime!, $email: String!, $channelId: ID!) { dailyPulse(after: $after, email: $email, channelId: $channelId)}`
      const lastWeek = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toJSON()
      const variables = {
        after: lastWeek,
        email: CHRONOS_PULSE_EMAIL,
        channelId: CHRONOS_PULSE_CHANNEL
      }
      publishWebhookGQL(query, variables)
    }
  })

  new CronJob({
    cronTime: '0 0 6 * * *' /* at 6:00 am daily */,
    start: true,
    timeZone,
    onTick() {
      const query = 'mutation SendBatchNotificationEmails { sendBatchNotificationEmails }'
      publishWebhookGQL(query, {})
    }
  })

  new CronJob({
    cronTime:
      '0 */10 * * * *' /* every 10th minute, set up jobs scheduled within the next 10:05mins */,
    start: true,
    timeZone,
    onTick() {
      const query = 'mutation RunScheduledJobs { runScheduledJobs(seconds: 605) }'
      publishWebhookGQL(query, {})
    }
  })

  new CronJob({
    cronTime: '0 0 0 1,15 * *' /* every 1st and 15th day of the month */,
    start: true,
    timeZone,
    onTick() {
      const query = `mutation UpdateOAuthTokens($updatedBefore: DateTime!) { updateOAuthRefreshTokens(updatedBefore: $updatedBefore) }`
      const variables = {updatedBefore: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toJSON()}
      publishWebhookGQL(query, variables)
    }
  })

  new CronJob({
    cronTime: '0 */5 * * * *' /* every 5 minutes */,
    start: true,
    timeZone,
    onTick() {
      const query = `
        mutation ProcessRecurrence{
          processRecurrence{
            ... on ProcessRecurrenceSuccess {
              meetingsStarted
              meetingsEnded
            }
          }
        }
      `
      publishWebhookGQL(query, {})
    }
  })

  console.log(`\n🌾🌾🌾 Server ID: ${SERVER_ID}. Ready for Chronos           🌾🌾🌾`)
}

chronos()
