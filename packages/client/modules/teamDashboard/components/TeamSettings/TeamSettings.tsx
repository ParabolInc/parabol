import {TeamSettings_viewer} from '../../../../__generated__/TeamSettings_viewer.graphql'
import React, {Component} from 'react'
import styled from '@emotion/styled'
import Helmet from 'react-helmet'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import Row from '../../../../components/Row/Row'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import ArchiveTeamContainer from '../../containers/ArchiveTeamContainer/ArchiveTeamContainer'
import {PALETTE} from '../../../../styles/paletteV2'
import ui from '../../../../styles/ui'
import {Layout} from '../../../../types/constEnums'
import {PERSONAL, PRO_LABEL} from '../../../../utils/constants'

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
  borderTop: `1px solid ${PALETTE.BORDER_LIGHTER}`,
  padding: Layout.ROW_GUTTER
})

const StyledRow = styled(Row)({
  borderTop: 0
})

interface Props extends WithAtmosphereProps, RouteComponentProps<{}> {
  viewer: TeamSettings_viewer
}

class TeamSettings extends Component<Props> {
  render () {
    const {
      history,
      viewer: {team}
    } = this.props
    if (!team) return null
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
              <StyledRow>
                <div>{'This team is currently on a personal plan.'}</div>
                <PrimaryButton onClick={() => history.push(`/me/organizations/${orgId}`)}>
                  {`Upgrade Team to ${PRO_LABEL}`}
                </PrimaryButton>
              </StyledRow>
            </Panel>
          )}
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

export default createFragmentContainer(withAtmosphere(withRouter(TeamSettings)), {
  viewer: graphql`
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
})
