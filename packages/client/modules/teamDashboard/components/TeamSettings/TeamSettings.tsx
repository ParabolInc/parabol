import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {TeamSettingsQuery} from '../../../../__generated__/TeamSettingsQuery.graphql'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import Row from '../../../../components/Row/Row'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'
import useRouter from '../../../../hooks/useRouter'
import {PALETTE} from '../../../../styles/paletteV3'
import {Layout, TierLabel} from '../../../../types/constEnums'
import ArchiveTeam from '../ArchiveTeam/ArchiveTeam'
import TeamPrivacyToggle from './TeamPrivacyToggle'

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
        ...TeamPrivacyToggle_team
        isViewerLead
        id
        name
        tier
        billingTier
        orgId
        teamMembers(sortBy: "preferredName") {
          teamMemberId: id
          user {
            id
            preferredName
            email
          }
          isLead
          isOrgAdmin
          isSelf
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
  const {name: teamName, orgId, teamMembers, tier, billingTier} = team!
  useDocumentTitle(`Team Settings | ${teamName}`, 'Team Settings')
  const viewerTeamMember = teamMembers.find((m) => m.isSelf)
  // if kicked out, the component might reload before the redirect occurs
  if (!viewerTeamMember) return null
  const {isLead: viewerIsLead, isOrgAdmin: viewerIsOrgAdmin} = viewerTeamMember
  const lead = teamMembers.find((m) => m.isLead)
  const contact = lead?.user ?? {email: 'love@parabol.co', preferredName: 'Parabol Support'}
  return (
    <TeamSettingsLayout>
      <PanelsLayout>
        {billingTier === 'starter' && (
          <Panel>
            <StyledRow>
              <div>
                {tier !== 'starter'
                  ? `This team is currently on a free trial for the ${TierLabel.TEAM} plan.`
                  : 'This team is currently on a starter plan.'}
              </div>
              <PrimaryButton onClick={() => history.push(`/me/organizations/${orgId}`)}>
                {`Upgrade to ${TierLabel.TEAM} Plan`}
              </PrimaryButton>
            </StyledRow>
          </Panel>
        )}
        {viewerIsLead || viewerIsOrgAdmin ? (
          <>
            <Panel label='Team Privacy'>
              <PanelRow>
                <TeamPrivacyToggle teamRef={team!} />
              </PanelRow>
            </Panel>
            <Panel label='Danger Zone'>
              <PanelRow>
                <ArchiveTeam team={team!} />
              </PanelRow>
            </Panel>
          </>
        ) : (
          <Panel className='mt-8'>
            <StyledRow>
              <div>
                This team is currently on a <b className='capitalize'>{billingTier} plan</b>. Only
                Team Leads can <b>delete a team</b>.<br />
                The <b>Team Lead</b> for {teamName} is{' '}
                <a href={`mailto:${contact.email}`} className='text-sky-500 underline'>
                  {contact.preferredName}
                </a>
                .
              </div>
            </StyledRow>
          </Panel>
        )}
      </PanelsLayout>
    </TeamSettingsLayout>
  )
}

export default TeamSettings
