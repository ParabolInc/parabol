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
import ToggleTeamDrawerMutation from '../../../../mutations/ToggleTeamDrawerMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import useBreakpoint from '../../../../hooks/useBreakpoint'

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
  const atmosphere = useAtmosphere()
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const drawerTypeRef = useRef<DrawerTypes | null>(null)
  const {submitting, onError, onCompleted, submitMutation} = useMutationProps()
  if (!team || !teamMember) return null
  const {hideAgenda, hideManageTeam, manageTeamMemberId} = teamMember
  const {id: teamId} = team
  const teamDrawerType =
    hideAgenda === false
      ? DrawerTypes.AGENDA
      : hideManageTeam === false
      ? DrawerTypes.MANAGE_TEAM
      : null

  // as drawer is closing, teamDrawerType is null. use ref to show prev content
  if (teamDrawerType && drawerTypeRef.current !== teamDrawerType) {
    drawerTypeRef.current = teamDrawerType
  }

  const toggleDrawer = () => {
    if (!submitting) {
      submitMutation()
      ToggleTeamDrawerMutation(
        atmosphere,
        {teamId, teamDrawerType: drawerTypeRef.current || DrawerTypes.AGENDA},
        {onError, onCompleted}
      )
    }
  }

  return (
    <ResponsiveDashSidebar isOpen={teamDrawerType !== null} isRightDrawer onToggle={toggleDrawer}>
      <DrawerContent isDesktop={isDesktop}>
        <DrawerHeader>
          <StyledLabelHeading>
            {drawerTypeRef.current === DrawerTypes.MANAGE_TEAM ? 'Manage Team' : 'Team Agenda'}
          </StyledLabelHeading>
          <CloseDrawer teamDrawerType={drawerTypeRef.current} teamId={teamId} />
        </DrawerHeader>
        {drawerTypeRef.current === DrawerTypes.MANAGE_TEAM ? (
          <ManageTeamList manageTeamMemberId={manageTeamMemberId} team={team} />
        ) : (
          <AgendaListAndInput dashSearch={dashSearch || ''} meeting={null} team={team} />
        )}
      </DrawerContent>
    </ResponsiveDashSidebar>
  )
}
export default TeamDrawer
