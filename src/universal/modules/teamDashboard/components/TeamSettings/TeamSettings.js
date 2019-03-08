import PropTypes from 'prop-types'
import React, {Component} from 'react'
import styled from 'react-emotion'
import Helmet from 'react-helmet'
import {createFragmentContainer} from 'react-relay'
import {withRouter} from 'react-router-dom'
import Panel from 'universal/components/Panel/Panel'
import Row from 'universal/components/Row/Row'
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

const PanelRow = styled('div')({
  borderTop: `.0625rem solid ${ui.rowBorderColor}`,
  padding: `${ui.panelGutter}`
})

class TeamSettings extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    viewer: PropTypes.object.isRequired
  }

  render() {
    const {
      history,
      viewer: {team}
    } = this.props
    const {orgId, teamName, teamMembers, tier} = team
    const viewerTeamMember = teamMembers.find((m) => m.isSelf)
    // if kicked out, the component might reload before the redirect occurs
    if (!viewerTeamMember) return null
    const {isLead: viewerIsLead} = viewerTeamMember
    return (
      <TeamSettingsLayout>
        <Helmet title={`Team Settings | ${teamName}`} />
        <PanelsLayout>
          {tier === PERSONAL && (
            <Panel>
              <Row>
                <div>{'This team is currently on a personal plan.'}</div>
                <PrimaryButton onClick={() => history.push(`/me/organizations/${orgId}`)}>
                  {`Upgrade Team to ${PRO_LABEL}`}
                </PrimaryButton>
              </Row>
            </Panel>
          )}
          {viewerIsLead && (
            <Panel label="Danger Zone">
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
  withAtmosphere(withRouter(TeamSettings)),
  graphql`
    fragment TeamSettings_viewer on User {
      team(teamId: $teamId) {
        ...ArchiveTeamContainer_team
        isViewerLead: isLead
        teamId: id
        teamName: name
        tier
        orgId
        teamMembers(sortBy: "preferredName") {
          teamMemberId: id
          userId
          isLead
          isSelf
          preferredName
        }
      }
    }
  `
)
