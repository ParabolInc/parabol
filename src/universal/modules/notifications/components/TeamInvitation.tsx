import {TeamInvitation_notification} from '__generated__/TeamInvitation_notification.graphql'
import React from 'react'
import styled, {css} from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import IconAvatar from 'universal/components/IconAvatar/IconAvatar'
import RaisedButton from 'universal/components/RaisedButton'
import Row from 'universal/components/Row/Row'
import defaultStyles from 'universal/modules/notifications/helpers/styles'
import AcceptTeamInvitationMutation from 'universal/mutations/AcceptTeamInvitationMutation'
import ui from 'universal/styles/ui'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

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
    invitation: {token},
    inviter: {preferredName: inviterName},
    team: {name: teamName}
  } = notification
  const accept = () => {
    submitMutation()
    AcceptTeamInvitationMutation(
      atmosphere,
      {invitationToken: token},
      {history, onError, onCompleted}
    )
  }

  return (
    <Row compact>
      <div className={css(defaultStyles.icon)}>
        <IconAvatar icon='group' size='small' />
      </div>
      <div className={css(defaultStyles.message)}>
        {'You have been invited by '}
        <b>{inviterName}</b>
        {' to join '}
        <b>{teamName}</b>
        {'.'}
      </div>
      <div className={css(defaultStyles.button)}>
        <StyledButton
          aria-label='Accept team invitation'
          size={ui.notificationButtonSize}
          onClick={accept}
          palette='warm'
          waiting={submitting}
        >
          {'Accept'}
        </StyledButton>
      </div>
    </Row>
  )
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(TeamInvitation))),
  graphql`
    fragment TeamInvitation_notification on NotificationTeamInvitation {
      id
      inviter {
        preferredName
      }
      invitation {
        token
      }
      team {
        name
      }
    }
  `
)
