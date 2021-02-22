import getPubSub from './getPubSub'
import {NotificationSubscriptionResponse} from '~/__generated__/NotificationSubscription.graphql'
import {OrganizationSubscriptionResponse} from '~/__generated__/OrganizationSubscription.graphql'
import {MeetingSubscriptionResponse} from '~/__generated__/MeetingSubscription.graphql'
import {TaskSubscriptionResponse} from '~/__generated__/TaskSubscription.graphql'
import {TeamSubscriptionResponse} from '~/__generated__/TeamSubscription.graphql'

export interface SubOptions {
  mutatorId?: string
  operationId?: string | null
}

type NotificationPayload =
  | NotificationSubscriptionResponse['notificationSubscription']['__typename']
  | 'AcceptTeamInvitationPayload'

type OrganizationPayload =
  | OrganizationSubscriptionResponse['organizationSubscription']['__typename']
  | 'DowngradeToPersonalPayload'

type MeetingPayload =
  | MeetingSubscriptionResponse['meetingSubscription']['__typename']
  | 'AutoGroupReflectionsPayload'
  | 'DragEstimatingTaskSuccess'

type TeamPayload =
  | TeamSubscriptionResponse['teamSubscription']['__typename']
  | 'AddPokerTemplatePayload'
  | 'AddPokerTemplateDimensionPayload'
  | 'AddPokerTemplateScalePayload'
  | 'AddPokerTemplateScaleValuePayload'
  | 'AddSlackAuthPayload'
  | 'DowngradeToPersonalPayload'
  | 'MovePokerTemplateDimensionPayload'
  | 'PokerTemplateDimensionUpdateDescriptionPayload'
  | 'ReflectTemplatePromptUpdateDescriptionPayload'
  | 'RemoveAtlassianAuthPayload'
  | 'RemoveGitHubAuthPayload'
  | 'RemovePokerTemplatePayload'
  | 'RemovePokerTemplateDimensionPayload'
  | 'RemovePokerTemplateScalePayload'
  | 'RemovePokerTemplateScalePayload'
  | 'RemoveSlackAuthPayload'
  | 'RenamePokerTemplateDimensionPayload'
  | 'RenamePokerTemplateScalePayload'
  | 'SetSlackNotificationPayload'
  | 'StartSprintPokerSuccess'
  | 'UpdatePokerTemplateDimensionScalePayload'
  | 'UpdatePokerTemplateScaleValuePayload'

interface SubTable {
  notification: NotificationPayload
  organization: OrganizationPayload
  meeting: MeetingPayload
  task: TaskSubscriptionResponse['taskSubscription']['__typename']
  team: TeamPayload
}

const publish = <T extends keyof SubTable>(
  topic: T,
  channel: string,
  type: SubTable[T],
  payload: {[key: string]: any},
  subOptions: SubOptions = {}
) => {
  const subName = `${topic}Subscription`
  const data = {...payload, type}
  const rootValue = {[subName]: data}
  getPubSub()
    .publish(`${topic}.${channel}`, {rootValue, ...subOptions})
    .catch(console.error)
}

export default publish
