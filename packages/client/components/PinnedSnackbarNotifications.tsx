import graphql from 'babel-plugin-relay/macro'
import {useEffect} from 'react'
import {useFragment} from 'react-relay'
import {useNavigate} from 'react-router'
import type {PinnedSnackbarNotifications_query$key} from '~/__generated__/PinnedSnackbarNotifications_query.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import SetNotificationStatusMutation from '../mutations/SetNotificationStatusMutation'
import mapNotificationToToast from '../mutations/toasts/mapNotificationToToast'

interface Props {
  queryRef: PinnedSnackbarNotifications_query$key
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
                ...mapTeamsLimitReminderToToast_notification @relay(mask: false) @alias
                ...mapPromptToJoinOrgToToast_notification @relay(mask: false) @alias
                ...mapRequestToJoinOrgToToast_notification @relay(mask: false) @alias
              }
            }
          }
        }
      }
    `,
    queryRef
  )
  const navigate = useNavigate()
  const atmosphere = useAtmosphere()
  const {viewer} = data
  const notifications = viewer?.pinnedNotifications || {edges: []}
  const {edges} = notifications
  const snackbarNotifications = edges.filter(({node}) => node.status === 'UNREAD')

  useEffect(() => {
    snackbarNotifications.forEach(({node}) => {
      const notificationSnack = mapNotificationToToast(node, {atmosphere, navigate})

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
