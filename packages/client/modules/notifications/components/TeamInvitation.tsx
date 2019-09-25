import {TeamInvitation_notification} from '../../../__generated__/TeamInvitation_notification.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import IconAvatar from '../../../components/IconAvatar/IconAvatar'
import RaisedButton from '../../../components/RaisedButton'
import Row from '../../../components/Row/Row'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../decorators/withAtmosphere/withAtmosphere'
import AcceptTeamInvitationMutation from '../../../mutations/AcceptTeamInvitationMutation'
import ui from '../../../styles/ui'
import withMutationProps, {WithMutationProps} from '../../../utils/relay/withMutationProps'
import NotificationButton from './NotificationButton'
import NotificationMessage from './NotificationMessage'

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  notification: TeamInvitation_notification
}

const StyledButton = styled(RaisedButton)({...ui.buttonBlockStyles})

const TeamInvitation = (props: Props) => {
  const {
    atmosphere,
    history,
    notification,
    submitting,
    submitMutation,
    onError,
    onCompleted
  } = props
  const {
    id: notificationId,
    invitation: {
      token,
      inviter: {preferredName: inviterName}
    },
    team: {name: teamName}
  } = notification
  const accept = () => {
    submitMutation()
    AcceptTeamInvitationMutation(
      atmosphere,
      {notificationId, invitationToken: token},
      {history, onError, onCompleted}
    )
  }

  return (
    <Row>
      <IconAvatar>group</IconAvatar>
      <NotificationMessage>
        {'You have been invited by '}
        <b>{inviterName}</b>
        {' to join '}
        <b>{teamName}</b>
        {'.'}
      </NotificationMessage>
      <NotificationButton>
        <StyledButton
          aria-label='Accept team invitation'
          size={'small'}
          onClick={accept}
          palette='warm'
          waiting={submitting}
        >
          {'Accept'}
        </StyledButton>
      </NotificationButton>
    </Row>
  )
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(TeamInvitation))),
  {
    notification: graphql`
      fragment TeamInvitation_notification on NotificationTeamInvitation {
        id
        invitation {
          token
          inviter {
            preferredName
          }
        }
        team {
          name
        }
      }
    `
  }
)
