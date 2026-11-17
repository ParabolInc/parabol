import type {InspirationItem} from '../../../postgres/types'
import type {GenerateInspirationItemsPayloadResolvers, ServiceEnum} from '../resolverTypes'

export type GenerateInspirationItemsPayloadSource = {
  meetingId: string
  inspirationItems: (Omit<InspirationItem, 'id'> & {id: string})[]
  issues: {
    service: ServiceEnum
    title: string
    url: string | null
    updatedAt: Date | null
    unusedReason: string | null
  }[]
}

const GenerateInspirationItemsPayload: GenerateInspirationItemsPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default GenerateInspirationItemsPayload
