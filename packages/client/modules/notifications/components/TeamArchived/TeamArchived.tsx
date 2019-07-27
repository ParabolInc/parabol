import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import AcknowledgeButton from '../AcknowledgeButton/AcknowledgeButton'
import ClearNotificationMutation from '../../../../mutations/ClearNotificationMutation'
import Row from '../../../../components/Row/Row'
import IconAvatar from '../../../../components/IconAvatar/IconAvatar'
import {TeamArchived_notification} from '../../../../__generated__/TeamArchived_notification.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import NotificationErrorMessage from '../NotificationErrorMessage'
import NotificationMessage from '../NotificationMessage'

interface Props {
  notification: TeamArchived_notification
}

const TeamArchived = (props: Props) => {
  const {notification} = props
  const atmosphere = useAtmosphere()
  const {error, submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const {id: notificationId, team} = notification
  const {name: teamName} = team

  const acknowledge = () => {
    if (submitting) return
    submitMutation()
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted)
  }

  return (
    <>
      <Row>
        <IconAvatar icon='archive' size='small' />
        <NotificationMessage>
          {'The team '}
          <b>{teamName}</b>
          {' was archived.'}
        </NotificationMessage>
        <AcknowledgeButton onClick={acknowledge} waiting={submitting} />
      </Row>
      <NotificationErrorMessage error={error} />
    </>
  )
}

export default createFragmentContainer(TeamArchived, {
  notification: graphql`
    fragment TeamArchived_notification on NotifyTeamArchived {
      id
      team {
        name
      }
    }
  `
})
