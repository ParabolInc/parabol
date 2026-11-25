import type {MeetingTypeEnum} from '../../../postgres/types/Meeting'
import type {MeetingPartnerResolvers} from '../resolverTypes'

export type MeetingPartnerSource = {
  userId: string
  lastMetAt: Date
  meetingType: MeetingTypeEnum
}

const MeetingPartner: MeetingPartnerResolvers = {
  user: ({userId}, _args, {dataLoader}) => dataLoader.get('users').loadNonNull(userId)
}

export default MeetingPartner
