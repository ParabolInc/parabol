import styled from '@emotion/styled'
import {Close} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {OrgPlanDrawer_organization$key} from '../../../../__generated__/OrgPlanDrawer_organization.graphql'
import Confetti from '../../../../components/Confetti'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import PlainButton from '../../../../components/PlainButton/PlainButton'
import ResponsiveDashSidebar from '../../../../components/ResponsiveDashSidebar'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {desktopSidebarShadow} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {
  BezierCurve,
  Breakpoint,
  DiscussionThreadEnum,
  GlobalBanner,
  ZIndex
} from '../../../../types/constEnums'
import OrgPlanDrawerContent from './OrgPlanDrawerContent'

const isGlobalBannerEnabled = window.__ACTION__.GLOBAL_BANNER_ENABLED

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
  paddingTop: isGlobalBannerEnabled ? GlobalBanner.HEIGHT : 0,
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
        billingTier
        showConfetti
      }
    `,
    organizationRef
  )
  const {id: orgId, billingTier, showDrawer, showConfetti} = organization
  const atmosphere = useAtmosphere()
  const isDesktop = useBreakpoint(Breakpoint.ORG_DRAWER)

  const toggleSidebar = () => {
    commitLocalUpdate(atmosphere, (store) => {
      const org = store.get(orgId)
      if (!org) return
      const showDrawer = org.getValue('showDrawer')
      org.setValue(!showDrawer, 'showDrawer')
    })
  }

  return (
    <>
      <ResponsiveDashSidebar
        isOpen={showDrawer}
        isDesktop={isDesktop}
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
          <OrgPlanDrawerContent tier={billingTier} />
        </Drawer>
      </ResponsiveDashSidebar>
      <div className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform'>
        <Confetti active={showConfetti} />
      </div>
    </>
  )
}

export default OrgPlanDrawer
