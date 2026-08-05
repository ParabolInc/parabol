import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {useNavigate} from 'react-router'
import type {TeamSettingsQuery} from '../../../../__generated__/TeamSettingsQuery.graphql'
import Panel from '../../../../components/Panel/Panel'
import PrimaryButton from '../../../../components/PrimaryButton'
import Row from '../../../../components/Row/Row'
import useDocumentTitle from '../../../../hooks/useDocumentTitle'
import {TierLabel} from '../../../../types/constEnums'
import ArchiveTeam from '../ArchiveTeam/ArchiveTeam'
import TeamPrivacyToggle from './TeamPrivacyToggle'

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
  const navigate = useNavigate()
  const {team} = viewer
  const {name: teamName, orgId, teamMembers, tier, billingTier} = team!
  useDocumentTitle(`Team Settings | ${teamName}`, 'Team Settings')
  const viewerTeamMember = teamMembers.find((m) => m.isSelf)
  // if kicked out, the component might reload before the redirect occurs
  if (!viewerTeamMember) return null
  const {isLead: viewerIsLead, isOrgAdmin: viewerIsOrgAdmin} = viewerTeamMember
  const lead = teamMembers.find((m) => m.isLead)
  const contact = lead?.user ?? {
    email: 'love@parabol.co',
    preferredName: 'Parabol Support'
  }
  return (
    <div className='flex w-full flex-1 flex-col'>
      <div className='mx-auto w-full max-w-[768px]'>
        {billingTier === 'starter' && (
          <Panel>
            <Row className='border-t-0'>
              <div>
                {tier !== 'starter'
                  ? `This team is currently on a free trial for the ${TierLabel.TEAM} plan.`
                  : 'This team is currently on a starter plan.'}
              </div>
              <PrimaryButton onClick={() => navigate(`/me/organizations/${orgId}`)}>
                {`Upgrade to ${TierLabel.TEAM} Plan`}
              </PrimaryButton>
            </Row>
          </Panel>
        )}
        {viewerIsLead || viewerIsOrgAdmin ? (
          <>
            <Panel label='Team Privacy'>
              <div className='border-hairline border-t p-4'>
                <TeamPrivacyToggle teamRef={team!} />
              </div>
            </Panel>
            <Panel label='Danger Zone'>
              <div className='border-hairline border-t p-4'>
                <ArchiveTeam team={team!} />
              </div>
            </Panel>
          </>
        ) : (
          <Panel className='mt-8'>
            <Row className='border-t-0'>
              <div>
                This team is currently on a <b className='capitalize'>{billingTier} plan</b>. Only
                Team Leads can <b>delete a team</b>.<br />
                The <b>Team Lead</b> for {teamName} is{' '}
                <a href={`mailto:${contact.email}`} className='text-accent underline'>
                  {contact.preferredName}
                </a>
                .
              </div>
            </Row>
          </Panel>
        )}
      </div>
    </div>
  )
}

export default TeamSettings
