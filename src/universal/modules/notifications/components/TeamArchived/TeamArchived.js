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

const TeamArchived = (props) => {
  const {atmosphere, notification, submitting, submitMutation, onError, onCompleted} = props
  const {
    notificationId,
    team: {teamName}
  } = notification
  const acknowledge = () => {
    submitMutation()
    ClearNotificationMutation(atmosphere, notificationId, onError, onCompleted)
  }

  return (
    <Row>
      <IconAvatar icon='archive' size='small' />
      <div className={css(defaultStyles.message)}>
        {'The team '}
        <b>{teamName}</b>
        {' was archived.'}
      </div>
      <AcknowledgeButton
        aria-label={clearNotificationLabel}
        onClick={acknowledge}
        waiting={submitting}
      />
    </Row>
  )
}

TeamArchived.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  submitMutation: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  notification: PropTypes.object.isRequired
}

export default createFragmentContainer(
  TeamArchived,
  graphql`
    fragment TeamArchived_notification on NotifyTeamArchived {
      notificationId: id
      team {
        teamName: name
      }
    }
  `
)
