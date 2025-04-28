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
import {LeaderElector} from './LeaderElector'
import {callGQL} from './utils/callGQL'
import {Logger} from './utils/Logger'
import RedisInstance from './utils/RedisInstance'

interface PossibleJob {
  onTick(): void
  cronTime: string | undefined
}

const {SERVER_ID} = process.env
if (!SERVER_ID) throw new Error('Missing Env Var: SERVER_ID')

const runningJobs: CronJob[] = []
const chronos = () => {
  const {
    CHRONOS_PULSE_EMAIL,
    CHRONOS_PULSE_CHANNEL,
    CHRONOS_AUTOPAUSE,
    CHRONOS_PULSE_DAILY,
    CHRONOS_PULSE_WEEKLY,
    CHRONOS_BATCH_EMAILS,
    CHRONOS_SCHEDULE_JOBS,
    CHRONOS_UPDATE_TOKENS,
    CHRONOS_PROCESS_RECURRENCE
  } = process.env
  const jobs: Record<string, PossibleJob> = {
    autoPause: {
      onTick: () => {
        const query = 'mutation AutoPauseUsers { autopauseUsers }'
        callGQL(query, {})
      },
      cronTime: CHRONOS_AUTOPAUSE
    },
    dailyPulse: {
      onTick: () => {
        const query = `query DailyPulse($after: DateTime!, $email: String!, $channelId: ID!) { dailyPulse(after: $after, email: $email, channelId: $channelId)}`
        const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24).toJSON()
        const variables = {
          after: yesterday,
          email: CHRONOS_PULSE_EMAIL,
          channelId: CHRONOS_PULSE_CHANNEL
        }
        callGQL(query, variables)
      },
      cronTime: CHRONOS_PULSE_DAILY
    },
    weeklyPulse: {
      onTick: () => {
        const query = `query WeeklyPulse($after: DateTime!, $email: String!, $channelId: ID!) { dailyPulse(after: $after, email: $email, channelId: $channelId)}`
        const lastWeek = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toJSON()
        const variables = {
          after: lastWeek,
          email: CHRONOS_PULSE_EMAIL,
          channelId: CHRONOS_PULSE_CHANNEL
        }
        callGQL(query, variables)
      },
      cronTime: CHRONOS_PULSE_WEEKLY
    },
    batchEmails: {
      onTick: () => {
        const query = 'mutation SendBatchNotificationEmails { sendBatchNotificationEmails }'
        callGQL(query, {})
      },
      cronTime: CHRONOS_BATCH_EMAILS
    },
    scheduleJobs: {
      onTick: () => {
        const query = 'mutation RunScheduledJobs { runScheduledJobs(seconds: 605) }'
        callGQL(query, {})
      },
      cronTime: CHRONOS_SCHEDULE_JOBS
    },
    updateTokens: {
      onTick: () => {
        const query = `mutation UpdateOAuthTokens($updatedBefore: DateTime!) { updateOAuthRefreshTokens(updatedBefore: $updatedBefore) }`
        const variables = {updatedBefore: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toJSON()}
        callGQL(query, variables)
      },
      cronTime: CHRONOS_UPDATE_TOKENS
    },
    processRecurrence: {
      onTick: () => {
        const query = `
          mutation ProcessRecurrence {
            processRecurrence{
              ... on ProcessRecurrenceSuccess {
                meetingsStarted
                meetingsEnded
              }
            }
          }
        `
        callGQL(query, {})
      },
      cronTime: CHRONOS_PROCESS_RECURRENCE
    }
  }
  Object.entries(jobs).forEach(([name, {onTick, cronTime}]) => {
    try {
      const job = CronJob.from({
        start: true,
        // assume non-null & catch on fail
        cronTime: cronTime!,
        onTick
      })
      runningJobs.push(job)
      Logger.log(`🌱 Chronos Job ${name}: STARTED`)
    } catch {
      Logger.log(`🌱 Chronos Job ${name}: SKIPPED`)
    }
  })
}

const runOnPrimary = () => {
  if (!__PRODUCTION__) return () => {}
  const redis = new RedisInstance(`chronosLock_${SERVER_ID}`)
  const leader = new LeaderElector(redis, 'chronos', 20_000)
  leader.on('elected', () => {
    Logger.log(`\n🌾🌾🌾 Server ID: ${SERVER_ID} Elected for Chronos           🌾🌾🌾`)
    chronos()
  })
  leader.on('revoked', () => {
    Logger.log(`\n🌾🌾🌾 Server ID: ${SERVER_ID} Lost Chronos           🌾🌾🌾`)
    runningJobs.forEach((job) => job.stop())
  })
  leader.start()
  return () => leader.stop()
}

export const stopChronos = runOnPrimary()
