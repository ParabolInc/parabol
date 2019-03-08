import PropTypes from 'prop-types'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer} from 'react-relay'
import AsyncComponent from 'universal/components/AsyncComponent'
import typePicker from 'universal/modules/notifications/helpers/typePicker'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import FormError from 'universal/components/FormError/FormError'

const StyledErrorMessage = styled(FormError)({
  fontSize: '.8125rem',
  padding: '0 8rem .75rem 3.5rem'
})

const NotificationRow = (props) => {
  const {atmosphere, error, submitting, submitMutation, onCompleted, onError, notification} = props
  const {type} = notification
  const fetchMod = typePicker[type]
  return (
    <div>
      <AsyncComponent
        atmosphere={atmosphere}
        loadingWidth="inherit"
        loadingHeight="5rem"
        fetchMod={fetchMod}
        notification={notification}
        submitting={submitting}
        submitMutation={submitMutation}
        onCompleted={onCompleted}
        onError={onError}
      />
      {error && <StyledErrorMessage>{error}</StyledErrorMessage>}
    </div>
  )
}

NotificationRow.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  notification: PropTypes.object.isRequired,
  // mutationProps
  error: PropTypes.any,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(NotificationRow)),
  graphql`
    fragment NotificationRow_notification on Notification {
      type
      ...KickedOut_notification
      ...PaymentRejected_notification
      ...TaskInvolves_notification
      ...PromoteToBillingLeader_notification
      ...TeamArchived_notification
      ...TeamInvitation_notification
    }
  `
)
