import {MasterPool, r} from 'rethinkdb-ts'
import TeamInvitation from '../database/types/TeamInvitation'
import {AnyMeetingMember} from '../postgres/types/Meeting'
import getRethinkConfig from './getRethinkConfig'
import {R} from './stricterR'
import MassInvitation from './types/MassInvitation'
import NotificationKickedOut from './types/NotificationKickedOut'
import NotificationMeetingStageTimeLimitEnd from './types/NotificationMeetingStageTimeLimitEnd'
import NotificationMentioned from './types/NotificationMentioned'
import NotificationPaymentRejected from './types/NotificationPaymentRejected'
import NotificationPromoteToBillingLeader from './types/NotificationPromoteToBillingLeader'
import NotificationResponseMentioned from './types/NotificationResponseMentioned'
import NotificationResponseReplied from './types/NotificationResponseReplied'
import NotificationTaskInvolves from './types/NotificationTaskInvolves'
import NotificationTeamArchived from './types/NotificationTeamArchived'
import NotificationTeamInvitation from './types/NotificationTeamInvitation'
import Task from './types/Task'

export type RethinkSchema = {
  MassInvitation: {
    type: MassInvitation
    index: 'teamMemberId'
  }
  MeetingMember: {
    type: AnyMeetingMember
    index: 'meetingId' | 'teamId' | 'userId'
  }
  NewFeature: {
    type: any
    index: ''
  }
  Notification: {
    type:
      | NotificationTaskInvolves
      | NotificationTeamArchived
      | NotificationMeetingStageTimeLimitEnd
      | NotificationPaymentRejected
      | NotificationKickedOut
      | NotificationPromoteToBillingLeader
      | NotificationTeamInvitation
      | NotificationResponseMentioned
      | NotificationResponseReplied
      | NotificationMentioned
    index: 'userId'
  }
  Task: {
    type: Task
    index:
      | 'integrationId'
      | 'tags'
      | 'teamId'
      | 'teamIdUpdatedAt'
      | 'discussionId'
      | 'userId'
      | 'integrationHash'
  }
  TeamInvitation: {
    type: TeamInvitation
    index: 'email' | 'teamId' | 'token'
  }
}

export type DBType = {
  [P in keyof RethinkSchema]: RethinkSchema[P]['type']
}

export type ParabolR = R<RethinkSchema>
const config = getRethinkConfig()
let isLoading = false
let isLoaded = false
let promise: Promise<MasterPool> | undefined
const getRethink = async () => {
  if (!isLoaded) {
    if (!isLoading) {
      isLoading = true
      promise = r.connectPool(config)
    }
    await promise
    isLoaded = true
  }
  // this is important because pm2 will restart the process & for whatever reason r isn't always healthy
  await r.waitForHealthy()
  return r as unknown as ParabolR
}

export const closeRethink = async () => {
  if (promise) {
    await (await promise).drain()
    isLoaded = false
    isLoading = false
    promise = undefined
  }
}

export default getRethink
