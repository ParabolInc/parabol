import PropTypes from 'prop-types'
import React from 'react'
import {connect} from 'react-redux'
import {createFragmentContainer} from 'react-relay'
import {withRouter} from 'react-router-dom'
import Type from 'universal/components/Type/Type'
import portal from 'react-portal-hoc'
import RemoveTeamMemberMutation from 'universal/mutations/RemoveTeamMemberMutation'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import DashModal from 'universal/components/Dashboard/DashModal'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import styled from 'react-emotion'

const StyledButton = styled(FlatButton)({
  margin: '1.5rem auto 0'
})

const RemoveTeamMemberModal = (props) => {
  const {
    atmosphere,
    dispatch,
    history,
    location,
    closeAfter,
    closePortal,
    isClosing,
    teamMember
  } = props
  const {teamMemberId, preferredName} = teamMember
  const handleClick = () => {
    closePortal()
    RemoveTeamMemberMutation(atmosphere, teamMemberId, {
      dispatch,
      history,
      location
    })
  }
  return (
    <DashModal onBackdropClick={closePortal} isClosing={isClosing} closeAfter={closeAfter}>
      <Type align='center' bold marginBottom='1.5rem' scale='s7' colorPalette='warm'>
        Are you sure?
      </Type>
      <Type align='center' bold marginBottom='1.5rem' scale='s4'>
        This will remove {preferredName} from <br />
        the team. <br />
      </Type>
      <StyledButton size='large' onClick={handleClick} palette='warm'>
        <IconLabel icon='arrow_forward' iconAfter label={`Remove ${preferredName}`} />
      </StyledButton>
    </DashModal>
  )
}

RemoveTeamMemberModal.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  isClosing: PropTypes.bool,
  teamMember: PropTypes.object.isRequired,
  toggle: PropTypes.any
}

export default createFragmentContainer(
  withRouter(
    connect()(portal({escToClose: true, closeAfter: 100})(withAtmosphere(RemoveTeamMemberModal)))
  ),
  graphql`
    fragment RemoveTeamMemberModal_teamMember on TeamMember {
      teamMemberId: id
      preferredName
    }
  `
)
