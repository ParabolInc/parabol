import PropTypes from 'prop-types'
import React, {Component} from 'react'
import styled from 'react-emotion'
import Helmet from 'react-helmet'
import {connect} from 'react-redux'
import {createFragmentContainer} from 'react-relay'
import {withRouter} from 'react-router-dom'
import InvitationRow from 'universal/components/InvitationRow'
import InviteUser from 'universal/components/InviteUser/InviteUser'
import Panel from 'universal/components/Panel/Panel'
import PendingApprovalRow from 'universal/components/PendingApprovalRow'
import Row from 'universal/components/Row/Row'
import TeamMemberRow from 'universal/components/TeamMemberRow'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import ArchiveTeamContainer from 'universal/modules/teamDashboard/containers/ArchiveTeamContainer/ArchiveTeamContainer'
import ui from 'universal/styles/ui'
import {PERSONAL, PRO_LABEL} from 'universal/utils/constants'
import PrimaryButton from 'universal/components/PrimaryButton'

const TeamSettingsLayout = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  width: '100%'
})

const PanelsLayout = styled('div')({
  margin: '0 auto',
  maxWidth: ui.settingsPanelMaxWidth,
  width: '100%'
})

const PanelInner = styled('div')({
  borderTop: `.0625rem solid ${ui.panelInnerBorderColor}`
})

const PanelRow = styled('div')({
  borderTop: `.0625rem solid ${ui.rowBorderColor}`,
  padding: `${ui.panelGutter}`
})

class TeamSettings extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    viewer: PropTypes.object.isRequired
  }

  render () {
    const {
      atmosphere: {viewerId},
      dispatch,
      history,
      viewer: {team}
    } = this.props
    const {
      teamId,
      invitations,
      isViewerLead,
      orgApprovals,
      orgId,
      teamName,
      teamMembers,
      tier
    } = team
    const viewerTeamMember = teamMembers.find((m) => m.isSelf)
    // if kicked out, the component might reload before the redirect occurs
    if (!viewerTeamMember) return null
    const {isLead: viewerIsLead} = viewerTeamMember
    const teamLead = teamMembers.find((teamMember) => teamMember.isLead)
    return (
      <TeamSettingsLayout>
        <Helmet title={`Team Settings | ${teamName}`} />
        <PanelsLayout>
          {tier === PERSONAL && (
            <Panel>
              <Row>
                <div>{'This team is currently on a personal plan.'}</div>
                <PrimaryButton onClick={() => history.push(`/me/organizations/${orgId}`)}>
                  {'Upgrade Team to '}
                  <b>{PRO_LABEL}</b>
                </PrimaryButton>
              </Row>
            </Panel>
          )}
          <Panel label='Manage Team'>
            <PanelInner>
              <InviteUser dispatch={dispatch} team={team} />
              {teamMembers.map((teamMember) => {
                const {teamMemberId, userId} = teamMember
                return (
                  <TeamMemberRow
                    key={`teamMemberKey${teamMemberId}`}
                    teamMember={teamMember}
                    teamLead={teamLead}
                    isSelf={viewerId === userId}
                    isViewerLead={isViewerLead}
                  />
                )
              })}
              {invitations.map((invitation) => {
                const {invitationId} = invitation
                return (
                  <InvitationRow
                    key={`invitationKey${invitationId}`}
                    invitation={invitation}
                    teamId={teamId}
                  />
                )
              })}
              {orgApprovals.map((orgApproval) => {
                const {orgApprovalId} = orgApproval
                return (
                  <PendingApprovalRow
                    key={`approval${orgApprovalId}`}
                    orgApproval={orgApproval}
                    team={team}
                  />
                )
              })}
            </PanelInner>
          </Panel>
          {viewerIsLead && (
            <Panel label='Danger Zone'>
              <PanelRow>
                <ArchiveTeamContainer team={team} />
              </PanelRow>
            </Panel>
          )}
        </PanelsLayout>
      </TeamSettingsLayout>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withRouter(connect()(TeamSettings))),
  graphql`
    fragment TeamSettings_viewer on User {
      team(teamId: $teamId) {
        ...InviteUser_team
        ...ArchiveTeamContainer_team
        ...PendingApprovalRow_team
        isViewerLead: isLead
        teamId: id
        teamName: name
        tier
        orgId
        teamMembers(sortBy: "preferredName") {
          ...TeamMemberRow_teamMember
          ...TeamMemberRow_teamLead
          teamMemberId: id
          userId
          isLead
          isSelf
          preferredName
        }
        invitations {
          ...InvitationRow_invitation
          invitationId: id
        }
        orgApprovals {
          ...PendingApprovalRow_orgApproval
          orgApprovalId: id
        }
      }
    }
  `
)
