import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import Row from '../../../../components/Row/Row'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'
import useRouter from '../../../../hooks/useRouter'
import {PALETTE} from '../../../../styles/paletteV3'
import {Layout, TierLabel} from '../../../../types/constEnums'
import {TeamSettingsQuery} from '../../../../__generated__/TeamSettingsQuery.graphql'
import ArchiveTeam from '../ArchiveTeam/ArchiveTeam'

const TeamSettingsLayout = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  width: '100%'
})

const PanelsLayout = styled('div')({
  margin: '0 auto',
  maxWidth: Layout.SETTINGS_MAX_WIDTH,
  width: '100%'
})

const PanelRow = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  padding: Layout.ROW_GUTTER
})

const StyledRow = styled(Row)({
  borderTop: 0
})

interface Props {
  queryRef: PreloadedQuery<TeamSettingsQuery>
}

const query = graphql`
  query TeamSettingsQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        ...ArchiveTeam_team
        isLead
        id
        name
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
  }
`

const TeamSettings = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<TeamSettingsQuery>(query, queryRef)
  const {viewer} = data
  const {history} = useRouter()
  const {team} = viewer
  const {name: teamName, orgId, teamMembers, tier} = team!
  useDocumentTitle(`Team Settings | ${teamName}`, 'Team Settings')
  const viewerTeamMember = teamMembers.find((m) => m.isSelf)
  // if kicked out, the component might reload before the redirect occurs
  if (!viewerTeamMember) return null
  const {isLead: viewerIsLead} = viewerTeamMember
  return (
    <TeamSettingsLayout>
      <PanelsLayout>
        {tier === 'starter' && (
          <Panel>
            <StyledRow>
              <div>{'This team is currently on a starter plan.'}</div>
              <PrimaryButton onClick={() => history.push(`/me/organizations/${orgId}`)}>
                {`Upgrade Team to ${TierLabel.TEAM}`}
              </PrimaryButton>
            </StyledRow>
          </Panel>
        )}
        {viewerIsLead && (
          <Panel label='Danger Zone'>
            <PanelRow>
              <ArchiveTeam team={team!} />
            </PanelRow>
          </Panel>
        )}
      </PanelsLayout>
    </TeamSettingsLayout>
  )
}

export default TeamSettings
