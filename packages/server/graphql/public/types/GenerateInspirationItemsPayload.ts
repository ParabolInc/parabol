import type {InspirationIssueSource} from '../mutations/helpers/toInspirationIssue'
import type {GenerateInspirationItemsPayloadResolvers} from '../resolverTypes'
import type {InspirationItemSource} from './InspirationItem'

export type GenerateInspirationItemsPayloadSource = {
  meetingId: string
  inspirationItems: InspirationItemSource[]
  issues: InspirationIssueSource[]
  issueCount: number
}

const GenerateInspirationItemsPayload: GenerateInspirationItemsPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default GenerateInspirationItemsPayload
