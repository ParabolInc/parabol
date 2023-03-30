import React from 'react'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {OrgPlanDrawer_organization$key} from '../../../../__generated__/OrgPlanDrawer_organization.graphql'
import ResponsiveDashSidebar from '../../../../components/ResponsiveDashSidebar'
import {Close} from '@mui/icons-material'
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
import PlainButton from '../../../../components/PlainButton/PlainButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'

const DrawerHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px 8px 16px 16px',
  width: '100%',
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

const CloseIcon = styled(Close)({
  color: PALETTE.SLATE_600,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.5
  }
})

const DrawerContent = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  backgroundColor: PALETTE.WHITE,
  display: 'flex',
  overflow: 'hidden',
  padding: `0 0 ${isDesktop ? 58 : 0}px`,
  height: '100vh',
  flexDirection: 'column'
  // width: RightSidebar.WIDTH
}))

const StyledCloseButton = styled(PlainButton)({
  height: 24,
  marginLeft: 'auto'
})

const StyledLabelHeading = styled(LabelHeading)({
  fontSize: 12,
  lineHeight: '18px',
  textTransform: 'none',
  //
  height: '100%'
})

type Props = {
  organizationRef: OrgPlanDrawer_organization$key
}

const OrgPlanDrawer = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgPlanDrawer_organization on Organization {
        id
        showSidebar
      }
    `,
    organizationRef
  )
  const {id: orgId, showSidebar} = organization
  console.log('🚀 ~ showSidebar:', showSidebar)
  const atmosphere = useAtmosphere()
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const toggleSidebar = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const org = store.get(orgId)
      if (!org) return
      const showSidebar = org.getValue('showSidebar')
      org.setValue(!showSidebar, 'showSidebar')
    })
  }
  return (
    <ResponsiveDashSidebar isOpen={showSidebar} onToggle={toggleSidebar} isRightDrawer>
      <Drawer isDesktop={true} isOpen={showSidebar}>
        <DrawerContent isDesktop={true}>
          <DrawerHeader>
            <StyledLabelHeading>{'Plan Details'}</StyledLabelHeading>
            {/* <CloseDrawer teamId={teamId} /> */}
            <StyledCloseButton onClick={toggleSidebar}>
              <CloseIcon />
            </StyledCloseButton>
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

export default OrgPlanDrawer
