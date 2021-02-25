import getPubSub from './getPubSub'
import {
  MeetingSubscriptionPayload,
  NotificationSubscriptionPayload,
  OrganizationSubscriptionPayload,
  TaskSubscriptionPayload,
  TeamSubscriptionPayload
} from 'parabol-client/types/graphql'

export interface SubOptions {
  mutatorId?: string
  operationId?: string | null
}

interface SubTable {
  notification: NotificationSubscriptionPayload['__typename']
  organization: OrganizationSubscriptionPayload['__typename']
  meeting: MeetingSubscriptionPayload['__typename']
  task: TaskSubscriptionPayload['__typename']
  team: TeamSubscriptionPayload['__typename']
}

const publish = <T extends keyof SubTable>(
  topic: T,
  channel: string,
  type: SubTable[T],
  payload: {[key: string]: any},
  subOptions: SubOptions = {}
) => {
  const subName = `${topic}Subscription`
  const data = {...payload, type}
  const rootValue = {[subName]: data}
  getPubSub()
    .publish(`${topic}.${channel}`, {rootValue, ...subOptions})
    .catch(console.error)
}

export default publish
