import {getUserId} from '../../../utils/authorization'
import type {GenerateInspirationItemsSuccessResolvers} from '../resolverTypes'

export type GenerateInspirationItemsSuccessSource = {
  meetingId: string
  service: string
}

const GenerateInspirationItemsSuccess: GenerateInspirationItemsSuccessResolvers = {
  inspirationItems: async ({meetingId, service}, _args, {authToken, dataLoader}) => {
    const userId = getUserId(authToken)
    return dataLoader.get('inspirationItemsByMeeting').load({meetingId, userId, service})
  },
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default GenerateInspirationItemsSuccess
