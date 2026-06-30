import type {InspirationItem} from '../../../postgres/types'
import type {GenerateInspirationItemsSuccessResolvers} from '../resolverTypes'

export type GenerateInspirationItemsSuccessSource = {
  meetingId: string
  inspirationItems: InspirationItem[]
}

const GenerateInspirationItemsSuccess: GenerateInspirationItemsSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default GenerateInspirationItemsSuccess
