import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import LabelHeading from '~/components/LabelHeading/LabelHeading'
import {TeamDrawer_viewer$key} from '~/__generated__/TeamDrawer_viewer.graphql'
import {TeamDrawer as TeamDrawerType} from '~/__generated__/ToggleTeamDrawerMutation.graphql'
import ResponsiveDashSidebar from '../../../../components/ResponsiveDashSidebar'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import useMutationProps from '../../../../hooks/useMutationProps'
import ToggleTeamDrawerMutation from '../../../../mutations/ToggleTeamDrawerMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint, RightSidebar} from '../../../../types/constEnums'
import AgendaListAndInput from '../AgendaListAndInput/AgendaListAndInput'
import CloseDrawer from '../CloseDrawer/CloseDrawer'
import ManageTeamList from '../ManageTeam/ManageTeamList'

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
  const {t} = useTranslation()

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
        <DrawerHeader>
          <StyledLabelHeading>
            {drawerTypeRef.current === 'manageTeam'
              ? t('TeamDrawer.ManageTeam')
              : t('TeamDrawer.TeamAgenda')}
          </StyledLabelHeading>
          <CloseDrawer teamId={teamId} />
        </DrawerHeader>
        {drawerTypeRef.current === 'manageTeam' ? (
          <ManageTeamList manageTeamMemberId={manageTeamMemberId} team={team} />
        ) : (
          <AgendaListAndInput dashSearch={dashSearch || ''} meeting={null} team={team} />
        )}
      </DrawerContent>
    </ResponsiveDashSidebar>
  )
}
export default TeamDrawer
