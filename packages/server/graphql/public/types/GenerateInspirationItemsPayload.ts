import type {InspirationItem} from '../../../postgres/types'
import type {GenerateInspirationItemsPayloadResolvers, ServiceEnum} from '../resolverTypes'

export type InspirationItemSource = Omit<InspirationItem, 'id'> & {id: string}

export type GenerateInspirationItemsPayloadSource = {
  meetingId: string
  inspirationItems: InspirationItemSource[]
  issues: {
    service: ServiceEnum
    kind: string
    title: string
    url: string | null
    updatedAt: Date | null
    importance: number
    unusedReason: string | null
    draft: InspirationItemSource | null
  }[]
  nextBefore: Date | null
}

const GenerateInspirationItemsPayload: GenerateInspirationItemsPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default GenerateInspirationItemsPayload
