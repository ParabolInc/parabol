import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {OptionalHandlers, StandardMutation} from '~/types/relayMutations'
import {SetNotificationStatusMutation as TSetNotificationStatusMutation} from '../__generated__/SetNotificationStatusMutation.graphql'

graphql`
  fragment SetNotificationStatusMutation_notification on SetNotificationStatusPayload {
    notification {
      id
      status
    }
  }
`

const mutation = graphql`
  mutation SetNotificationStatusMutation($notificationId: ID!, $status: NotificationStatusEnum!) {
    setNotificationStatus(notificationId: $notificationId, status: $status) {
      error {
        message
      }
      ...SetNotificationStatusMutation_notification @relay(mask: false)
    }
  }
`

const SetNotificationStatusMutation: StandardMutation<
  TSetNotificationStatusMutation,
  OptionalHandlers
> = (atmosphere, variables, {onError, onCompleted}) => {
  return commitMutation<TSetNotificationStatusMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {notificationId, status} = variables
      const notification = store.get(notificationId)
      if (!notification) return
      notification.setValue(status, 'status')
    },
    onCompleted,
    onError
  })
}

export default SetNotificationStatusMutation
