import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {useFragment} from 'react-relay'
import LabelHeading from '~/components/LabelHeading/LabelHeading'
import {TeamDrawer_viewer$key} from '~/__generated__/TeamDrawer_viewer.graphql'
import {Breakpoint, DrawerTypes, RightSidebar} from '../../../../types/constEnums'
import AgendaListAndInput from '../AgendaListAndInput/AgendaListAndInput'
import ManageTeamList from '../ManageTeam/ManageTeamList'
import CloseDrawer from '../CloseDrawer/CloseDrawer'
import ResponsiveDashSidebar from '../../../../components/ResponsiveDashSidebar'
import {PALETTE} from '../../../../styles/paletteV3'
import ToggleAgendaListMutation from '../../../../mutations/ToggleAgendaListMutation'
import ToggleManageTeamMutation from '../../../../mutations/ToggleManageTeamMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useBreakpoint from '../../../../hooks/useBreakpoint'

const SidebarHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px 8px 16px 16px'
})

const SidebarContent = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  backgroundColor: PALETTE.WHITE,
  display: 'flex',
  overflow: 'hidden',
  padding: `0 0 ${isDesktop ? 58 : 0}px`,
  height: '100vh',
  flexDirection: 'column',
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
          hideAgenda
          hideManageTeam
          manageTeamMemberId
        }
      }
    `,
    props.viewer
  )
  const {dashSearch, team, teamMember} = data
  const hideAgenda = teamMember?.hideAgenda
  const hideManageTeam = teamMember?.hideManageTeam
  const manageTeamMemberId = teamMember?.manageTeamMemberId
  const teamId = team?.id
  const atmosphere = useAtmosphere()
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const sidebarTypeRef = useRef<string | null>(null)
  if (!hideAgenda && hideManageTeam) {
    sidebarTypeRef.current = DrawerTypes.AGENDA
  } else if (hideAgenda && !hideManageTeam) {
    sidebarTypeRef.current = DrawerTypes.MANAGE_TEAM
  }
  const showAgenda = sidebarTypeRef.current === DrawerTypes.AGENDA
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()
  const toggleSidebar = () => {
    if (!submitting) {
      submitMutation()
      if (!hideManageTeam) {
        ToggleManageTeamMutation(atmosphere, {teamId: teamId!}, {onError, onCompleted})
      } else if (!hideAgenda) {
        ToggleAgendaListMutation(atmosphere, teamId, onError, onCompleted)
      }
    }
  }

  if (!team || !teamId) return null
  return (
    <ResponsiveDashSidebar
      isOpen={!hideAgenda || !hideManageTeam}
      isRightDrawer
      onToggle={toggleSidebar}
    >
      <SidebarContent isDesktop={isDesktop}>
        <SidebarHeader>
          <StyledLabelHeading>{showAgenda ? 'Team Agenda' : 'Manage Team'}</StyledLabelHeading>
          <CloseDrawer isAgenda={showAgenda} teamId={teamId} />
        </SidebarHeader>
        {showAgenda ? (
          <AgendaListAndInput dashSearch={dashSearch || ''} meeting={null} team={team} />
        ) : (
          <ManageTeamList manageTeamMemberId={manageTeamMemberId} team={team} />
        )}
      </SidebarContent>
    </ResponsiveDashSidebar>
  )
}
export default TeamDrawer
