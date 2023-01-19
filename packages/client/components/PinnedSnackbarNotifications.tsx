import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {PinnedSnackbarNotifications_query$key} from '~/__generated__/PinnedSnackbarNotifications_query.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import SetNotificationStatusMutation from '../mutations/SetNotificationStatusMutation'
import mapTeamsLimitExceededToToast from '../mutations/toasts/mapTeamsLimitExceededToToast'
import mapTeamsLimitReminderToToast from '../mutations/toasts/mapTeamsLimitReminderToToast'
import {OnNextHistoryContext} from '../types/relayMutations'
import {NotificationEnum} from '../__generated__/popNotificationToast_notification.graphql'
import {Snack} from './Snackbar'

interface Props {
  queryRef: PinnedSnackbarNotifications_query$key
}

const typePicker: Partial<
  Record<NotificationEnum, (notification: any, context: OnNextHistoryContext) => Snack | null>
> = {
  TEAMS_LIMIT_EXCEEDED: mapTeamsLimitExceededToToast,
  TEAMS_LIMIT_REMINDER: mapTeamsLimitReminderToToast
}

const PinnedSnackbarNotifications = ({queryRef}: Props) => {
  const data = useFragment(
    graphql`
      fragment PinnedSnackbarNotifications_query on Query {
        viewer {
          pinnedNotifications: notifications(
            first: 10
            types: [TEAMS_LIMIT_EXCEEDED, TEAMS_LIMIT_REMINDER]
          ) {
            edges {
              node {
                id
                status
                type
                ...mapTeamsLimitExceededToToast_notification @relay(mask: false)
                ...mapTeamsLimitReminderToToast_notification @relay(mask: false)
              }
            }
          }
        }
      }
    `,
    queryRef
  )
  const {history} = useRouter()
  const atmosphere = useAtmosphere()
  const {viewer} = data
  const notifications = viewer?.pinnedNotifications || {edges: []}
  const {edges} = notifications
  const snackbarNotifications = edges.filter(
    ({node}) => node.status === 'UNREAD' && Object.keys(typePicker).includes(node.type)
  )

  snackbarNotifications.forEach(({node}) => {
    const specificNotificationToastMapper = typePicker[node.type]
    if (!specificNotificationToastMapper) {
      return
    }

    const notificationSnack = specificNotificationToastMapper(node, {
      atmosphere,
      history
    })

    if (!notificationSnack) {
      return
    }

    if (notificationSnack.autoDismiss === 0) {
      const callback = notificationSnack.onDismiss
      notificationSnack.onDismiss = () => {
        const {id: notificationId} = node
        SetNotificationStatusMutation(
          atmosphere,
          {
            notificationId,
            status: 'CLICKED'
          },
          {}
        )

        callback?.()
      }
    }

    if (notificationSnack.action) {
      const callback = notificationSnack.action.callback
      notificationSnack.action = {
        ...notificationSnack.action,
        callback: () => {
          const {id: notificationId} = node
          SetNotificationStatusMutation(
            atmosphere,
            {
              notificationId,
              status: 'CLICKED'
            },
            {}
          )

          callback()
        }
      }
    }

    atmosphere.eventEmitter.emit('addSnackbar', notificationSnack)
  })

  return null
}

export default PinnedSnackbarNotifications
