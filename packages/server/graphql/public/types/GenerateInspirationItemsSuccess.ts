import type {InspirationItem} from '../../../postgres/types'
import type {GenerateInspirationItemsSuccessResolvers, ServiceEnum} from '../resolverTypes'

export type GenerateInspirationItemsSuccessSource = {
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

const GenerateInspirationItemsSuccess: GenerateInspirationItemsSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default GenerateInspirationItemsSuccess
