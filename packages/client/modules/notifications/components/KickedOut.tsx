import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import AcknowledgeButton from './AcknowledgeButton/AcknowledgeButton'
import SetNotificationStatusMutation from '../../../mutations/SetNotificationStatusMutation'
import Row from '../../../components/Row/Row'
import IconAvatar from '../../../components/IconAvatar/IconAvatar'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import {KickedOut_notification} from '../../../__generated__/KickedOut_notification.graphql'
import NotificationErrorMessage from './NotificationErrorMessage'
import NotificationMessage from './NotificationMessage'
import {NotificationStatusEnum} from 'types/graphql'

interface Props {
  notification: KickedOut_notification
}

const KickedOut = (props: Props) => {
  const {notification} = props
  const {submitting, submitMutation, onError, onCompleted, error} = useMutationProps()
  const {id: notificationId, team} = notification
  const {name: teamName} = team
  const atmosphere = useAtmosphere()
  const acknowledge = () => {
    submitMutation()
    SetNotificationStatusMutation(
      atmosphere,
      {notificationId, status: NotificationStatusEnum.CLICKED},
      {onError, onCompleted}
    )
  }
  return (
    <>
      <Row>
        <IconAvatar>group</IconAvatar>
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
      id
      team {
        id
        name
      }
    }
  `
})
