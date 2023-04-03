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
import {EnterpriseBenefits, TeamBenefits} from '../../../../utils/constants'
import {upperFirst} from '../../../../utils/upperFirst'

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

const List = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  padding: '16px 0px',
  position: 'relative',
  width: '100%'
})

const DrawerContent = styled('div')({
  backgroundColor: PALETTE.WHITE,
  display: 'flex',
  overflow: 'hidden',
  padding: 16,
  height: '100vh',
  flexDirection: 'column'
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

const Title = styled('span')({
  fontWeight: 600,
  fontSize: 20
})

const Subtitle = styled('span')({
  fontWeight: 600,
  paddingBottom: 8
})

const UL = styled('ul')({
  margin: 0
})

const LI = styled('li')<{isBlue?: boolean}>(({isBlue}) => ({
  fontSize: 16,
  lineHeight: '28px',
  color: isBlue ? PALETTE.SKY_500 : PALETTE.SLATE_900,
  textTransform: 'none',
  fontWeight: 400,
  textAlign: 'left',
  listStyleType: 'disc'
}))

const Link = styled('a')({
  color: PALETTE.SKY_500,
  fontWeight: 600,
  textDecoration: 'none',
  '&:hover': {
    color: PALETTE.SKY_500,
    textDecoration: 'underline'
  }
})

const agileResources = [
  {
    title: '57 Daily Standup Questions for More Engaging Updates',
    url: 'https://www.parabol.co/resources/daily-standup-questions/'
  },
  {
    title: '29 Effective Meeting Tips for Advanced Facilitators',
    url: 'https://www.parabol.co/blog/effective-meeting-tips/'
  },
  {
    title: '50+ Retrospective Questions for your Next Meeting',
    url: 'https://www.parabol.co/resources/retrospective-questions/'
  },
  {
    title: '8 Agile Estimation Techniques to Try With your Team',
    url: 'https://www.parabol.co/blog/agile-estimation-techniques/'
  }
]

const enterpriseResources = {
  retros: 'https://www.parabol.co/agile/retrospectives/',
  estimation: 'https://www.parabol.co/agile/sprint-poker/',
  standups: 'https://www.parabol.co/agile/online-standup-tool/',
  templates: 'https://www.parabol.co/templates/',
  integrations: 'https://www.parabol.co/integrations/'
}

const featuresLookup = {
  starter: [],
  team: TeamBenefits,
  enterprise: EnterpriseBenefits
} as const

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
        <DrawerContent>
          <Title>{`🎉 Welcome to the ${upperFirst(tier)} Plan!`}</Title>
          <List>
            <Subtitle>
              {'In addition to the Parabol features you’re used to, you now have access to: '}
            </Subtitle>
            <UL>
              {featuresLookup[tier].map((feature) => (
                <LI key={feature}>{feature}</LI>
              ))}
            </UL>
          </List>
          <List>
            <Subtitle>{'Resources for effective agile teams:'}</Subtitle>
            <UL>
              {agileResources.map((resource) => (
                <LI isBlue key={resource.title}>
                  <Link href={resource.url} target='_blank' rel='noopener noreferrer'>
                    {resource.title}
                  </Link>
                </LI>
              ))}
            </UL>
          </List>
          {tier === 'enterprise' && (
            <List>
              <Subtitle>{'Make the most out of Parabol:'}</Subtitle>
              <UL>
                <LI>
                  {'Cover all of your agile meetings - '}
                  <Link href={enterpriseResources.retros} target='_blank' rel='noopener noreferrer'>
                    {'retros, '}
                  </Link>
                  <Link
                    target='_blank'
                    rel='noopener noreferrer'
                    href={enterpriseResources.estimation}
                  >
                    {'estimation'}
                  </Link>
                  {' & '}
                  <Link
                    target='_blank'
                    rel='noopener noreferrer'
                    href={enterpriseResources.standups}
                  >
                    {'standups'}
                  </Link>
                </LI>
                <LI>
                  <Link
                    target='_blank'
                    rel='noopener noreferrer'
                    href={enterpriseResources.templates}
                  >
                    {'40+ Meeting Templates'}
                  </Link>
                </LI>
                <LI>
                  <Link
                    target='_blank'
                    rel='noopener noreferrer'
                    href={enterpriseResources.integrations}
                  >
                    {'Integrate with Jira, Slack & More'}
                  </Link>
                </LI>
              </UL>
            </List>
          )}
        </DrawerContent>
      </Drawer>
    </ResponsiveDashSidebar>
  )
}

export default OrgPlanDrawer
