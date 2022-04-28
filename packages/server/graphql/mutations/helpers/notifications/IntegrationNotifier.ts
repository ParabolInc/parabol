import {MattermostNotifier} from './MattermostNotifier'
import {EmptyNotifier, Notifier} from './Notifier'
import {SlackNotifier} from './SlackNotifier'

const notifiers = [MattermostNotifier, SlackNotifier]

export const IntegrationNotifier = {
  ...Object.fromEntries(
    Object.entries(EmptyNotifier).map(([name, fun]) => [
      name,
      async (...args: Parameters<typeof fun>) => {
        await Promise.allSettled(
          notifiers.map(async (notifier) => {
            notifier[name](...args)
          })
        )
      }
    ])
  )
} as Notifier
