import PropTypes from 'prop-types'
import React from 'react'
import portal from 'react-portal-hoc'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveOrgUserMutation from 'universal/mutations/RemoveOrgUserMutation'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {withRouter} from 'react-router-dom'
import DashModal from 'universal/components/Dashboard/DashModal'
import DialogHeading from 'universal/components/DialogHeading'
import DialogContent from 'universal/components/DialogContent'
import PrimaryButton from 'universal/components/PrimaryButton'
import IconLabel from 'universal/components/IconLabel'
import styled from 'react-emotion'

const StyledHeading = styled(DialogHeading)({
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 4
})

const StyledContent = styled(DialogContent)({
  paddingBottom: 12,
  paddingLeft: 12,
  paddingRight: 12
})

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

const RemoveFromOrgModal = (props) => {
  const {
    atmosphere,
    closeAfter,
    closePortal,
    history,
    location,
    isClosing,
    onError,
    onCompleted,
    submitting,
    submitMutation,
    orgId,
    preferredName,
    userId
  } = props
  const handleClick = () => {
    submitMutation()
    RemoveOrgUserMutation(atmosphere, {orgId, userId}, {history, location}, onError, onCompleted)
  }
  return (
    <DashModal
      closeAfter={closeAfter}
      closePortal={closePortal}
      isClosing={isClosing}
      onBackdropClick={closePortal}
    >
      <StyledHeading>{'Are you sure?'}</StyledHeading>
      <StyledContent>
        {`This will remove ${preferredName} from the organization. Any outstanding tasks will be given
        to the team leads. Any time remaining on their subscription will be refunded on the next
        invoice.`}
        <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
          <IconLabel icon='arrow_forward' iconAfter label={`Remove ${preferredName}`} />
        </StyledButton>
      </StyledContent>
    </DashModal>
  )
}

RemoveFromOrgModal.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.any,
  closePortal: PropTypes.func,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  isClosing: PropTypes.bool,
  orgId: PropTypes.string.isRequired,
  preferredName: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
}

export default withRouter(
  withAtmosphere(withMutationProps(portal({escToClose: true, closeAfter: 100})(RemoveFromOrgModal)))
)
