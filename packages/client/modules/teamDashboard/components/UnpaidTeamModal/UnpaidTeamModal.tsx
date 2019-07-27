import {UnpaidTeamModal_viewer} from '../../../../__generated__/UnpaidTeamModal_viewer.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import DashModal from '../../../../components/Dashboard/DashModal'
import DialogContent from '../../../../components/DialogContent'
import DialogTitle from '../../../../components/DialogTitle'
import IconLabel from '../../../../components/IconLabel'
import PrimaryButton from '../../../../components/PrimaryButton'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'

const StyledButton = styled(PrimaryButton)({
  margin: '1.5rem auto 0'
})

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {
  viewer: UnpaidTeamModal_viewer
}

const UnpaidTeamModal = (props: Props) => {
  const {atmosphere, history, viewer} = props
  const {viewerId} = atmosphere
  const {team} = viewer
  if (!team) return null
  const {teamName, organization} = team
  const {orgId, billingLeaders, orgName} = organization
  const billingLeaderName = billingLeaders[0].preferredName
  const isALeader = billingLeaders.findIndex((leader) => leader.id === viewerId) !== -1
  const handleClick = () => history.push(`/me/organizations/${orgId}`)
  const problem = `There in an unpaid invoice for ${teamName}.`
  const solution = isALeader
    ? `Head over to ${orgName} Settings to add a payment method`
    : `Try reaching out to ${billingLeaderName}`
  return (
    <DashModal>
      <DialogTitle>{'Oh dear…'}</DialogTitle>
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

export default createFragmentContainer(withAtmosphere(withRouter(UnpaidTeamModal)), {
  viewer: graphql`
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
})
