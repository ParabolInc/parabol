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

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

const LeaveOrgModal = (props) => {
  const {
    atmosphere,
    closeAfter,
    closePortal,
    history,
    location,
    isClosing,
    submitting,
    submitMutation,
    onCompleted,
    onError,
    orgId,
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
      <DialogHeading>{'Are you sure?'}</DialogHeading>
      <DialogContent>
        {'This will remove you from the organization and all teams under it! '}
        <br />
        {'To undo it, you’ll have to ask another Billing Leader to re-add you.'}
        <StyledButton size='medium' onClick={handleClick} waiting={submitting}>
          <IconLabel icon='arrow_forward' iconAfter label='Leave the organization' />
        </StyledButton>
      </DialogContent>
    </DashModal>
  )
}

LeaveOrgModal.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  isClosing: PropTypes.bool,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  orgId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
}

export default withRouter(
  withAtmosphere(withMutationProps(portal({escToClose: true, closeAfter: 100})(LeaveOrgModal)))
)
