import PropTypes from 'prop-types'
import React from 'react'
import portal from 'react-portal-hoc'
import Button from 'universal/components/Button/Button'
import Type from 'universal/components/Type/Type'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveOrgUserMutation from 'universal/mutations/RemoveOrgUserMutation'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import {withRouter} from 'react-router-dom'
import DashModal from 'universal/components/Dashboard/DashModal'

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
      <Type align='center' bold marginBottom='1.5rem' scale='s7' colorPalette='warm'>
        Are you sure?
      </Type>
      <Type align='center' bold marginBottom='1.5rem' scale='s4'>
        This will remove {preferredName} from the organization. Any outstanding tasks will be given
        to the team leads. Any time remaining on their subscription will be refunded on the next
        invoice.
        <br />
      </Type>
      <Button
        buttonStyle='flat'
        colorPalette='warm'
        icon='arrow-circle-right'
        iconPlacement='right'
        label={`Remove ${preferredName}`}
        onClick={handleClick}
        buttonSize='large'
        waiting={submitting}
      />
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
