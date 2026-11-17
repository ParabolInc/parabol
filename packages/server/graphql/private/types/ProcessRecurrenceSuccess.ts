import type {ProcessRecurrenceSuccessResolvers} from '../resolverTypes'

export type ProcessRecurrenceSuccessSource = {
  meetingsStarted: number
  meetingsEnded: number
  remindersSent: number
}

const ProcessRecurrenceSuccess: ProcessRecurrenceSuccessResolvers = {}

export default ProcessRecurrenceSuccess
