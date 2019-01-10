import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {withRouter} from 'react-router-dom'
import ui from 'universal/styles/ui'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import DashModal from 'universal/components/Dashboard/DashModal'
import DialogHeading from 'universal/components/DialogHeading'
import DialogContent from 'universal/components/DialogContent'
import PrimaryButton from 'universal/components/PrimaryButton'
import IconLabel from 'universal/components/IconLabel'
import styled from 'react-emotion'

const StyledButton = styled(PrimaryButton)({
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
      <DialogHeading>{'Oh dear…'}</DialogHeading>
      <DialogContent>
        {problem}
        <br />
        {solution}
        {isALeader && (
          <StyledButton size='medium' onClick={handleClick}>
            <IconLabel icon='arrow_forward' iconAfter label='Take me there' />
          </StyledButton>
        )}
      </DialogContent>
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
