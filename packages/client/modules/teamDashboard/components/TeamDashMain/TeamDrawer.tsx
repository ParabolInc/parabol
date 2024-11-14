import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useRef} from 'react'
import {useFragment} from 'react-relay'
import {TeamDrawer_viewer$key} from '~/__generated__/TeamDrawer_viewer.graphql'
import {TeamDrawer as TeamDrawerType} from '~/__generated__/ToggleTeamDrawerMutation.graphql'
import LabelHeading from '~/components/LabelHeading/LabelHeading'
import MassInvitationTokenLinkRoot from '../../../../components/MassInvitationTokenLinkRoot'
import ResponsiveDashSidebar from '../../../../components/ResponsiveDashSidebar'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import useMutationProps from '../../../../hooks/useMutationProps'
import ToggleTeamDrawerMutation from '../../../../mutations/ToggleTeamDrawerMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {AppBar, Breakpoint, GlobalBanner, RightSidebar} from '../../../../types/constEnums'
import AgendaListAndInput from '../AgendaListAndInput/AgendaListAndInput'
import CloseDrawer from '../CloseDrawer/CloseDrawer'
import ManageTeamList from '../ManageTeam/ManageTeamList'

const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED

const bottomPadding = isGlobalBannerEnabled ? AppBar.HEIGHT + GlobalBanner.HEIGHT : AppBar.HEIGHT

const DrawerHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px 8px 16px 16px'
})

const DrawerContent = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  backgroundColor: PALETTE.WHITE,
  display: 'flex',
  overflow: 'hidden',
  padding: `0 0 ${isDesktop ? bottomPadding : 0}px`,
  paddingTop: !isDesktop && isGlobalBannerEnabled ? GlobalBanner.HEIGHT : 0,
  height: '100vh',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: RightSidebar.WIDTH
}))

const StyledLabelHeading = styled(LabelHeading)({
  fontSize: 12,
  lineHeight: '18px',
  textTransform: 'none'
})

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
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
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
      <DrawerContent isDesktop={isDesktop}>
        <div className='flex h-full flex-col'>
          <div className='flex-1 overflow-y-auto'>
            <DrawerHeader>
              <StyledLabelHeading>
                {drawerTypeRef.current === 'manageTeam' ? 'Manage Team' : 'Team Agenda'}
              </StyledLabelHeading>
              <CloseDrawer teamId={teamId} />
            </DrawerHeader>
            {drawerTypeRef.current === 'manageTeam' ? (
              <ManageTeamList manageTeamMemberId={manageTeamMemberId} team={team} />
            ) : (
              <AgendaListAndInput dashSearch={dashSearch || ''} meeting={null} team={team} />
            )}
          </div>
          {drawerTypeRef.current === 'manageTeam' && (
            <div className='mt-auto p-4'>
              <div style={{backgroundColor: PALETTE.SLATE_200}} className='rounded-lg p-4'>
                <h2 className='my-0 flex items-center py-0 pb-1 text-base leading-[21px]'>
                  Invite to Team
                </h2>
                <p className='my-0 py-0 pb-4 text-sm leading-[16px]'>
                  This link expires in 30 days
                </p>
                <div className='overflow-x-hidden pb-2'>
                  <div className='bg-white'>
                    <MassInvitationTokenLinkRoot meetingId={undefined} teamId={teamId} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </ResponsiveDashSidebar>
  )
}
export default TeamDrawer
