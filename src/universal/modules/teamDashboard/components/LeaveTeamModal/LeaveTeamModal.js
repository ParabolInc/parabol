import PropTypes from 'prop-types'
import React from 'react'
import portal from 'react-portal-hoc'
import {connect} from 'react-redux'
import {createFragmentContainer} from 'react-relay'
import {withRouter} from 'react-router-dom'
import Type from 'universal/components/Type/Type'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import RemoveTeamMemberMutation from 'universal/mutations/RemoveTeamMemberMutation'
import DashModal from 'universal/components/Dashboard/DashModal'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import styled from 'react-emotion'

const StyledButton = styled(FlatButton)({
  margin: '1.5rem auto 0'
})

const LeaveTeamModal = (props) => {
  const {
    atmosphere,
    closeAfter,
    closePortal,
    dispatch,
    isClosing,
    location,
    history,
    teamLead,
    teamMember
  } = props
  const {teamMemberId} = teamMember
  const teamLeadName = teamLead ? teamLead.preferredName : 'your leader'
  const handleClick = () => {
    // the KICKED_OUT message will handle this anyways, but it's great to do it here to avoid the ducks of doom
    history.push('/me')
    closePortal()
    RemoveTeamMemberMutation(atmosphere, teamMemberId, {
      dispatch,
      location,
      history
    })
  }
  return (
    <DashModal onBackdropClick={closePortal} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align='center' bold marginBottom='1.5rem' scale='s7' colorPalette='warm'>
        {'Are you sure?'}
      </Type>
      <Type align='center' bold marginBottom='1.5rem' scale='s4'>
        {'This will remove you from the team.'}
        <br />
        {`All of your tasks will be given to ${teamLeadName}`}
      </Type>
      <StyledButton size='large' onClick={handleClick} palette='warm'>
        <IconLabel icon='arrow-circle-right' iconAfter label='Leave the team' />
      </StyledButton>
    </DashModal>
  )
}

LeaveTeamModal.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  dispatch: PropTypes.func,
  inputModal: PropTypes.bool,
  isClosing: PropTypes.bool,
  onBackdropClick: PropTypes.func,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  teamMember: PropTypes.object.isRequired
}

export default createFragmentContainer(
  portal({escToClose: true, closeAfter: 100})(
    connect()(withAtmosphere(withRouter(LeaveTeamModal)))
  ),
  graphql`
    fragment LeaveTeamModal_teamLead on TeamMember {
      preferredName
    }

    fragment LeaveTeamModal_teamMember on TeamMember {
      teamMemberId: id
    }
  `
)
