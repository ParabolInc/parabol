import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {withRouter} from 'react-router-dom'
import Type from 'universal/components/Type/Type'
import ui from 'universal/styles/ui'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import DashModal from 'universal/components/Dashboard/DashModal'
import FlatButton from 'universal/components/FlatButton'
import IconLabel from 'universal/components/IconLabel'
import styled from 'react-emotion'

const StyledButton = styled(FlatButton)({
  margin: '1.5rem auto 0'
})

const UnpaidTeamModal = (props) => {
  const {atmosphere, isClosing, closeAfter, history, modalLayout, viewer} = props
  const {viewerId} = atmosphere
  const {
    team: {teamName, organization}
  } = viewer
  const {orgId, billingLeaders, orgName} = organization
  const billingLeaderName = billingLeaders[0].preferredName
  const isALeader = billingLeaders.findIndex((leader) => leader.id === viewerId) !== -1
  const handleClick = () => history.push(`/me/organizations/${orgId}`)
  const problem = `There in an unpaid invoice for ${teamName}.`
  const solution = isALeader
    ? `Head over to ${orgName} Settings to add a payment method`
    : `Try reaching out to ${billingLeaderName}`
  return (
    <DashModal
      position='absolute'
      modalLayout={modalLayout}
      isClosing={isClosing}
      closeAfter={closeAfter}
    >
      <Type align='center' bold marginBottom='1.5rem' scale='s7' colorPalette='warm'>
        {'Oh dear…'}
      </Type>
      <Type align='center' bold marginBottom='1.5rem' scale='s4'>
        {problem}
        <br />
        {solution}
      </Type>
      {isALeader && (
        <StyledButton size='large' onClick={handleClick} palette='warm'>
          <IconLabel icon='arrow_forward' iconAfter label='Take me there' />
        </StyledButton>
      )}
    </DashModal>
  )
}

UnpaidTeamModal.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  closeAfter: PropTypes.number,
  closePortal: PropTypes.func,
  history: PropTypes.object.isRequired,
  isClosing: PropTypes.bool,
  modalLayout: PropTypes.oneOf(ui.modalLayout),
  viewer: PropTypes.object.isRequired
}

export default createFragmentContainer(
  withAtmosphere(withRouter(UnpaidTeamModal)),
  graphql`
    fragment UnpaidTeamModal_viewer on User {
      team(teamId: $teamId) {
        organization {
          orgId: id
          billingLeaders {
            id
            preferredName
          }
          creditCard {
            brand
          }
          orgName: name
        }
        teamName: name
      }
    }
  `
)
