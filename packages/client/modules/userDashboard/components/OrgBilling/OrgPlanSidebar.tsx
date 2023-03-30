import React from 'react'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {OrgPlanSidebar_organization$key} from '../../../../__generated__/OrgPlanSidebar_organization.graphql'
import ResponsiveDashSidebar from '../../../../components/ResponsiveDashSidebar'
import {PALETTE} from '../../../../styles/paletteV3'
import {
  BezierCurve,
  Breakpoint,
  DiscussionThreadEnum,
  RightSidebar,
  ZIndex
} from '../../../../types/constEnums'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import {desktopSidebarShadow} from '../../../../styles/elevation'
import useBreakpoint from '../../../../hooks/useBreakpoint'

const DrawerHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px 8px 16px 16px',
  height: '100%',
  border: '2px solid red'
})

const Drawer = styled('div')<{isDesktop: boolean; isOpen: boolean}>(({isDesktop, isOpen}) => ({
  boxShadow: isDesktop ? desktopSidebarShadow : undefined,
  backgroundColor: '#FFFFFF',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'stretch',
  overflow: 'hidden',
  position: isDesktop ? 'fixed' : 'static',
  bottom: 0,
  top: 0,
  right: isDesktop ? 0 : undefined,
  transition: `all 200ms ${BezierCurve.DECELERATE}`,
  userSelect: 'none',
  transform: `translateX(${isOpen ? 0 : DiscussionThreadEnum.WIDTH}px)`,
  width: DiscussionThreadEnum.WIDTH,
  zIndex: ZIndex.SIDEBAR,
  height: '100%',
  '@supports (height: 1svh) and (height: 1lvh)': {
    height: isDesktop ? '100lvh' : '100svh'
  }
}))

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
  textTransform: 'none',
  //
  height: '100%'
})

type Props = {
  organizationRef: OrgPlanSidebar_organization$key
}

const OrgPlanSidebar = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgPlanSidebar_organization on Organization {
        showSidebar
      }
    `,
    organizationRef
  )
  const {showSidebar} = organization
  console.log('🚀 ~ showSidebar:', showSidebar)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const toggleSidebar = () => {}
  return (
    <ResponsiveDashSidebar isOpen={showSidebar} onToggle={toggleSidebar} isRightDrawer>
      <Drawer isDesktop={true} isOpen={showSidebar}>
        <DrawerContent isDesktop={true}>
          <DrawerHeader>
            <StyledLabelHeading>{'testa'}</StyledLabelHeading>
            {/* <CloseDrawer teamId={teamId} /> */}
            {/* <StyledCloseButton onClick={onToggleDrawer}>
              <CloseIcon />
            </StyledCloseButton> */}
          </DrawerHeader>
          {/* {drawerTypeRef.current === 'manageTeam' ? (
          <ManageTeamList manageTeamMemberId={manageTeamMemberId} team={team} />
        ) : (
          <AgendaListAndInput dashSearch={dashSearch || ''} meeting={null} team={team} />
        )} */}
        </DrawerContent>
      </Drawer>
    </ResponsiveDashSidebar>
  )
}

export default OrgPlanSidebar
