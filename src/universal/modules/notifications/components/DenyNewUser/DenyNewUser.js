import {css} from 'react-emotion'
import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import AcknowledgeButton from 'universal/modules/notifications/components/AcknowledgeButton/AcknowledgeButton'
import defaultStyles from 'universal/modules/notifications/helpers/styles'
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation'
import {clearNotificationLabel} from '../../helpers/constants'
import Row from 'universal/components/Row/Row'
import IconAvatar from 'universal/components/IconAvatar/IconAvatar'

const DenyNewUser = (props) => {
  const {atmosphere, notification, submitting, submitMutation, onError, onCompleted} = props
  const {notificationId, reason, deniedByName, inviteeEmail} = notification
  const acknowledge = () => {
    submitMutation()
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted)
  }
  const safeReason = reason || 'none given'
  return (
    <Row compact>
      <IconAvatar icon='user-circle-o' size='small' />
      <div className={css(defaultStyles.message)}>
        <b>{deniedByName}</b>
        {' has denied '}
        <b>{inviteeEmail}</b>
        {' from joining the organization.'}
        <br />
        <b>
          <i>{'Reason'}</i>
        </b>
        {': “'}
        <i>{safeReason}</i>
        {'”'}
      </div>
      <AcknowledgeButton
        aria-label={clearNotificationLabel}
        onClick={acknowledge}
        waiting={submitting}
      />
    </Row>
  )
}

DenyNewUser.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.object.isRequired
}

export default createFragmentContainer(
  DenyNewUser,
  graphql`
    fragment DenyNewUser_notification on NotifyDenial {
      notificationId: id
      deniedByName
      inviteeEmail
      reason
    }
  `
)
