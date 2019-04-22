import {css} from 'react-emotion'
import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import AcknowledgeButton from 'universal/modules/notifications/components/AcknowledgeButton/AcknowledgeButton'
import defaultStyles from 'universal/modules/notifications/helpers/styles'
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation'
import {clearNotificationLabel} from '../helpers/constants'
import RowCompact from 'universal/components/Row/RowCompact'
import IconAvatar from 'universal/components/IconAvatar/IconAvatar'

const KickedOut = (props) => {
  const {atmosphere, notification, submitting, submitMutation, onError, onCompleted} = props
  const {notificationId, team} = notification
  const {name: teamName} = team
  const acknowledge = () => {
    submitMutation()
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted)
  }
  return (
    <RowCompact>
      <IconAvatar icon='group' size='small' />
      <div className={css(defaultStyles.message)}>
        {'You have been removed from the '}
        <b>{teamName}</b>
        {' team.'}
      </div>
      <AcknowledgeButton
        aria-label={clearNotificationLabel}
        onClick={acknowledge}
        waiting={submitting}
      />
    </RowCompact>
  )
}

KickedOut.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.object.isRequired
}

export default createFragmentContainer(
  KickedOut,
  graphql`
    fragment KickedOut_notification on NotifyKickedOut {
      notificationId: id
      team {
        id
        name
      }
    }
  `
)
