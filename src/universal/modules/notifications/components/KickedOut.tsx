import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import AcknowledgeButton from 'universal/modules/notifications/components/AcknowledgeButton/AcknowledgeButton'
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation'
import Row from 'universal/components/Row/Row'
import IconAvatar from 'universal/components/IconAvatar/IconAvatar'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useMutationProps from 'universal/hooks/useMutationProps'
import {KickedOut_notification} from '__generated__/KickedOut_notification.graphql'
import NotificationErrorMessage from 'universal/modules/notifications/components/NotificationErrorMessage'
import NotificationMessage from './NotificationMessage'

interface Props {
  notification: KickedOut_notification
}

const KickedOut = (props: Props) => {
  const {notification} = props
  const {submitting, submitMutation, onError, onCompleted, error} = useMutationProps()
  const {notificationId, team} = notification
  const {name: teamName} = team
  const atmosphere = useAtmosphere()
  const acknowledge = () => {
    submitMutation()
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted)
  }
  return (
    <>
      <Row>
        <IconAvatar icon='group' size='small' />
        <NotificationMessage>
          {'You have been removed from the '}
          <b>{teamName}</b>
          {' team.'}
        </NotificationMessage>
        <AcknowledgeButton onClick={acknowledge} waiting={submitting} />
      </Row>
      <NotificationErrorMessage error={error} />
    </>
  )
}

export default createFragmentContainer(KickedOut, {
  notification: graphql`
    fragment KickedOut_notification on NotifyKickedOut {
      notificationId: id
      team {
        id
        name
      }
    }
  `
})
