import type {GenerateInspirationItemsPayloadResolvers, ServiceEnum} from '../resolverTypes'
import type {InspirationItemSource} from './InspirationItem'

export type GenerateInspirationItemsPayloadSource = {
  meetingId: string
  inspirationItems: InspirationItemSource[]
  issues: {
    service: ServiceEnum
    kind: string
    title: string
    url: string | null
    updatedAt: Date | null
    unusedReason: string | null
    draft: InspirationItemSource | null
  }[]
}

const GenerateInspirationItemsPayload: GenerateInspirationItemsPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default GenerateInspirationItemsPayload
