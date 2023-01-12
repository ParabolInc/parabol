import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {ValueOf} from '~/types/generics'
import lazyPreload, {LazyExoticPreload} from '~/utils/lazyPreload'
import {
  NotificationEnum,
  NotificationSnackbarPicker_notification$key
} from '~/__generated__/NotificationSnackbarPicker_notification.graphql'

const typePicker = {
  TEAMS_LIMIT_EXCEEDED: lazyPreload(
    () =>
      import(/* webpackChunkName: 'TeamsLimitExceededSnackbar' */ './TeamsLimitExceededSnackbar')
  )
} as Record<NotificationEnum, LazyExoticPreload<any>>

interface Props {
  notificationRef: NotificationSnackbarPicker_notification$key
}

const NotificationSnackbarPicker = (props: Props) => {
  const {notificationRef} = props

  const notification = useFragment(
    graphql`
      fragment NotificationSnackbarPicker_notification on Notification {
        type
        id
        ...TeamsLimitExceededSnackbar_notification
      }
    `,
    notificationRef
  )

  const {type} = notification

  const SpecificNotification = typePicker[type] as ValueOf<typeof typePicker>

  if (!SpecificNotification) return null

  return (
    <Suspense fallback={''}>
      <SpecificNotification notification={notification} />
    </Suspense>
  )
}

export default NotificationSnackbarPicker
