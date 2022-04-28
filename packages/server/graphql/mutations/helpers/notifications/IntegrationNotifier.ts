import {MattermostNotifier} from './MattermostNotifier'
import {Notifier} from './Notifier'
import {SlackNotifier} from './SlackNotifier'

const notifiers = [MattermostNotifier, SlackNotifier]
//const methods: (keyof Notifier)[] = ['startMeeting', 'endMeeting', 'startTimeLimit', 'endTimeLimit', 'integrationUpdated']

const f = notifiers[0]!

export const IntegrationNotifier = {
  ...Object.fromEntries(
    Object.entries(f).map(([key, method]) => [
      key,
      async (...args: Parameters<typeof method>) => {
        await Promise.allSettled(
          notifiers.map(async (notifier) => {
            notifier[key](...args)
          })
        )
      }
    ])
  )
} as Notifier
