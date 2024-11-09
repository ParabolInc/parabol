import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {PinnedSnackbarNotifications_query$key} from '~/__generated__/PinnedSnackbarNotifications_query.graphql'
import {NotificationEnum} from '../__generated__/popNotificationToast_notification.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useRouter from '../hooks/useRouter'
import SetNotificationStatusMutation from '../mutations/SetNotificationStatusMutation'
import mapPromptToJoinOrgToToast from '../mutations/toasts/mapPromptToJoinOrgToToast'
import mapRequestToJoinOrgToToast from '../mutations/toasts/mapRequestToJoinOrgToToast'
import mapTeamsLimitReminderToToast from '../mutations/toasts/mapTeamsLimitReminderToToast'
import {OnNextHistoryContext} from '../types/relayMutations'
import {Snack} from './Snackbar'

interface Props {
  queryRef: PinnedSnackbarNotifications_query$key
}

const typePicker: Partial<
  Record<NotificationEnum, (notification: any, context: OnNextHistoryContext) => Snack | null>
> = {
  TEAMS_LIMIT_REMINDER: mapTeamsLimitReminderToToast,
  PROMPT_TO_JOIN_ORG: mapPromptToJoinOrgToToast,
  REQUEST_TO_JOIN_ORG: mapRequestToJoinOrgToToast
}

const PinnedSnackbarNotifications = ({queryRef}: Props) => {
  const data = useFragment(
    graphql`
      fragment PinnedSnackbarNotifications_query on Query {
        viewer {
          pinnedNotifications: notifications(
            first: 10
            types: [TEAMS_LIMIT_REMINDER, PROMPT_TO_JOIN_ORG, REQUEST_TO_JOIN_ORG]
          ) {
            edges {
              node {
                id
                status
                type
                ...mapTeamsLimitReminderToToast_notification @relay(mask: false)
                ...mapPromptToJoinOrgToToast_notification @relay(mask: false)
                ...mapRequestToJoinOrgToToast_notification @relay(mask: false)
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

  useEffect(() => {
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

      const callback = notificationSnack.onManualDismiss
      notificationSnack.onManualDismiss = () => {
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

      atmosphere.eventEmitter.emit('addSnackbar', notificationSnack)
    })
  }, [])

  return null
}

export default PinnedSnackbarNotifications
