import PropTypes from 'prop-types'
import React from 'react'
import portal from 'react-portal-hoc'
import {createFragmentContainer} from 'react-relay'
import Type from 'universal/components/Type/Type'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import PromoteToTeamLeadMutation from 'universal/mutations/PromoteToTeamLeadMutation'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import DashModal from 'universal/components/Dashboard/DashModal'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import styled from 'react-emotion'

const StyledButton = styled(FlatButton)({
  marginTop: '1.5rem'
})

const PromoteTeamMemberModal = (props) => {
  const {
    atmosphere,
    closeAfter,
    closePortal,
    isClosing,
    submitMutation,
    submitting,
    onError,
    onCompleted,
    teamMember
  } = props
  const {preferredName, teamMemberId} = teamMember
  const handleClick = () => {
    submitMutation()
    PromoteToTeamLeadMutation(atmosphere, teamMemberId, onError, onCompleted)
    closePortal()
  }
  return (
    <DashModal onBackdropClick={closePortal} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align='center' bold marginBottom='1.5rem' scale='s7' colorPalette='warm'>
        {'Are you sure?'}
      </Type>
      <Type align='center' bold marginBottom='1.5rem' scale='s4'>
        {'You will be removed as the team leader'}
        <br />
        {`and promote ${preferredName}. You will no`}
        <br />
        {'longer be able to change team membership.'}
        <br />
        <br />
        {'This cannot be undone!'}
      </Type>
      <StyledButton size='large' onClick={handleClick} palette='warm' waiting={submitting}>
        <IconLabel icon='arrow-circle-right' iconAfter label={`Yes, promote ${preferredName}`} />
      </StyledButton>
    </DashModal>
  )
}

PromoteTeamMemberModal.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  isClosing: PropTypes.bool,
  onBackdropClick: PropTypes.func,
  teamMember: PropTypes.object.isRequired,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired
}

export default createFragmentContainer(
  portal({escToClose: true, closeAfter: 100})(
    withMutationProps(withAtmosphere(PromoteTeamMemberModal))
  ),
  graphql`
    fragment PromoteTeamMemberModal_teamMember on TeamMember {
      teamMemberId: id
      preferredName
    }
  `
)
