import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import type {TeamDrawer_viewer$key} from '~/__generated__/TeamDrawer_viewer.graphql'
import type {TeamDrawer as TeamDrawerType} from '~/__generated__/ToggleTeamDrawerMutation.graphql'
import LabelHeading from '~/components/LabelHeading/LabelHeading'
import MassInvitationTokenLinkRoot from '../../../../components/MassInvitationTokenLinkRoot'
import ResponsiveDashSidebar from '../../../../components/ResponsiveDashSidebar'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import ToggleTeamDrawerMutation from '../../../../mutations/ToggleTeamDrawerMutation'
import AgendaListAndInput from '../AgendaListAndInput/AgendaListAndInput'
import CloseDrawer from '../CloseDrawer/CloseDrawer'
import ManageTeamList from '../ManageTeam/ManageTeamList'

interface Props {
  viewer: TeamDrawer_viewer$key
}

const TeamDrawer = (props: Props) => {
  const data = useFragment(
    graphql`
      fragment TeamDrawer_viewer on User {
        dashSearch
        team(teamId: $teamId) {
          id
          ...AgendaListAndInput_team
          ...ManageTeamList_team
        }
        teamMember(teamId: $teamId) {
          openDrawer
          manageTeamMemberId
        }
      }
    `,
    props.viewer
  )
  const {dashSearch, team, teamMember} = data
  const atmosphere = useAtmosphere()
  const drawerTypeRef = useRef<TeamDrawerType | null>(null)
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()
  if (!team || !teamMember) return null
  const {openDrawer, manageTeamMemberId} = teamMember
  const {id: teamId} = team

  // as drawer is closing, teamDrawerType is null. use ref to show prev content
  if (openDrawer && drawerTypeRef.current !== openDrawer) {
    drawerTypeRef.current = openDrawer
  }

  const toggleDrawer = () => {
    if (!submitting) {
      submitMutation()
      ToggleTeamDrawerMutation(
        atmosphere,
        {teamId, teamDrawerType: drawerTypeRef.current || 'agenda'},
        {onError, onCompleted}
      )
    }
  }

  return (
    <ResponsiveDashSidebar isOpen={openDrawer !== null} isRightDrawer onToggle={toggleDrawer}>
      <div className='flex h-full w-64 flex-col bg-surface-drawer'>
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-0 flex-1 overflow-y-auto'>
            <div className='flex items-center justify-between py-4 pr-2 pl-4'>
              <LabelHeading style={{lineHeight: '18px', textTransform: 'none'}}>
                {drawerTypeRef.current === 'manageTeam' ? 'Manage Team' : 'Team Agenda'}
              </LabelHeading>
              <CloseDrawer teamId={teamId} />
            </div>
            {drawerTypeRef.current === 'manageTeam' ? (
              <ManageTeamList manageTeamMemberId={manageTeamMemberId} team={team} />
            ) : (
              <AgendaListAndInput dashSearch={dashSearch || ''} meeting={null} team={team} />
            )}
          </div>
          {drawerTypeRef.current === 'manageTeam' && (
            <div className='mt-auto p-4'>
              {/* raised, not well: the drawer is already the darkest surface in dark mode */}
              <div className='rounded-lg bg-surface-raised p-4'>
                <h2 className='my-0 flex items-center py-0 pb-1 text-base leading-[21px]'>
                  Invite to Team
                </h2>
                <p className='my-0 py-0 pb-4 text-sm leading-[16px]'>
                  This link expires in 30 days
                </p>
                <div className='overflow-x-hidden pb-2'>
                  <div className='bg-surface-card'>
                    <MassInvitationTokenLinkRoot meetingId={undefined} teamId={teamId} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveDashSidebar>
  )
}
export default TeamDrawer
