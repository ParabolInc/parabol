import React from 'react'
import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {OrgPlanDrawer_organization$key} from '../../../../__generated__/OrgPlanDrawer_organization.graphql'
import ResponsiveDashSidebar from '../../../../components/ResponsiveDashSidebar'
import {Close} from '@mui/icons-material'
import {PALETTE} from '../../../../styles/paletteV3'
import {BezierCurve, Breakpoint, DiscussionThreadEnum, ZIndex} from '../../../../types/constEnums'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import {desktopSidebarShadow} from '../../../../styles/elevation'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import OrgPlanDrawerContent from './OrgPlanDrawerContent'

const DrawerHeader = styled('div')({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px 8px 16px 16px',
  width: '100%'
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

const StyledCloseButton = styled(PlainButton)({
  height: ICON_SIZE.MD18,
  display: 'flex',
  alignItems: 'center'
})

const StyledLabelHeading = styled(LabelHeading)({
  fontSize: 12,
  lineHeight: '18px',
  textTransform: 'none'
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
        showDrawer
        tier
      }
    `,
    organizationRef
  )
  const {id: orgId, tier, showDrawer} = organization
  const atmosphere = useAtmosphere()
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const toggleSidebar = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const org = store.get(orgId)
      if (!org) return
      const showDrawer = org.getValue('showDrawer')
      org.setValue(!showDrawer, 'showDrawer')
    })
  }

  return (
    <ResponsiveDashSidebar
      isOpen={showDrawer}
      onToggle={toggleSidebar}
      isRightDrawer
      sidebarWidth={DiscussionThreadEnum.WIDTH}
    >
      <Drawer isDesktop={isDesktop} isOpen={showDrawer}>
        <DrawerHeader>
          <StyledLabelHeading>{'Plan Details'}</StyledLabelHeading>
          <StyledCloseButton onClick={toggleSidebar}>
            <CloseIcon />
          </StyledCloseButton>
        </DrawerHeader>
        <OrgPlanDrawerContent tier={tier} />
      </Drawer>
    </ResponsiveDashSidebar>
  )
}

export default OrgPlanDrawer
