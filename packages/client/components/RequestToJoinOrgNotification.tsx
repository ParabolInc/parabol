import graphql from 'babel-plugin-relay/macro'
import React, {lazy} from 'react'
import {useFragment} from 'react-relay'
import {RequestToJoinOrgNotification_notification$key} from '~/__generated__/RequestToJoinOrgNotification_notification.graphql'
import NotificationAction from './NotificationAction'
import NotificationTemplate from './NotificationTemplate'
import useModal from '../hooks/useModal'

interface Props {
  notification: RequestToJoinOrgNotification_notification$key
}

const ReviewRequestToJoinOrgModal = lazy(
  () =>
    import(/* webpackChunkName: 'ReviewRequestToJoinOrgModal' */ './ReviewRequestToJoinOrgModal')
)

const RequestToJoinOrgNotification = (props: Props) => {
  const {notification: notificationRef} = props
  const notification = useFragment(
    graphql`
      fragment RequestToJoinOrgNotification_notification on NotifyRequestToJoinOrg {
        ...NotificationTemplate_notification
        id
        name
        email
        picture
        requestCreatedBy
      }
    `,
    notificationRef
  )
  const {togglePortal, modalPortal, closePortal} = useModal({
    id: 'reviewRequestToJoinOrgModal',
    parentId: 'topBarNotificationsMenu'
  })
  const {name, email, picture, requestCreatedBy} = notification

  const onActionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    togglePortal()
  }

  return (
    <>
      <NotificationTemplate
        avatar={picture}
        message={`${name} has requested to join your organization`}
        action={<NotificationAction label={`Review ${email}`} onClick={onActionClick} />}
        notification={notification}
      />
      {modalPortal(
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <ReviewRequestToJoinOrgModal
            closePortal={closePortal}
            requestCreatedBy={requestCreatedBy}
            email={email}
          />
        </div>
      )}
    </>
  )
}

export default RequestToJoinOrgNotification
