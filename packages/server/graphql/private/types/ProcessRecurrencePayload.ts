import type {ProcessRecurrencePayloadResolvers} from '../resolverTypes'

export type ProcessRecurrencePayloadSource = {
  meetingsStarted: number
  meetingsEnded: number
  remindersSent: number
}

const ProcessRecurrencePayload: ProcessRecurrencePayloadResolvers = {}

export default ProcessRecurrencePayload
