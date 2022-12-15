import styled from '@emotion/styled'
import {Info} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useBreakpoint from '../hooks/useBreakpoint'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import {fadeIn} from '../styles/animation'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {BezierCurve, Breakpoint} from '../types/constEnums'
import plural from '../utils/plural'
import {InsightsDomainPanel_domain$key} from '../__generated__/InsightsDomainPanel_domain.graphql'
import FloatingActionButton from './FloatingActionButton'
import InsightsDomainNudge from './InsightsDomainNudge'
import Panel from './Panel/Panel'

const StatsPanel = styled(Panel)({
  boxShadow: Elevation.Z3,
  maxWidth: 600
})

const Wrapper = styled('div')({
  paddingLeft: 16,
  paddingRight: 16
})

const DomainName = styled('div')({
  fontSize: 32,
  fontWeight: 600,
  lineHeight: '48px',
  padding: 16
})

const ExceededLimit = styled('div')({
  fontSize: 32,
  fontWeight: 600,
  lineHeight: '48px',
  padding: 16,
  borderTop: `1px solid ${PALETTE.SLATE_400}`
})

const WarningMsg = styled('div')({
  background: PALETTE.GOLD_100,
  padding: '0px 8px',
  fontSize: 16,
  borderRadius: 2
})

const StatBlocks = styled('div')({
  display: 'flex',
  borderTop: `1px solid ${PALETTE.SLATE_400}`,
  width: '100%',
  flexWrap: 'wrap'
})

const ButtonBlock = styled('div')({
  animation: `${fadeIn} 200ms ${BezierCurve.DECELERATE}`,
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'flex-start',
  pointerEvents: 'none',
  width: '100%',
  zIndex: 1,
  height: '100%',
  marginTop: 16
})

const Button = styled(FloatingActionButton)({
  border: 0,
  fontSize: 16,
  padding: '10px 32px',
  pointerEvents: 'all'
})

const StatBlock = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  borderLeft: `1px solid ${PALETTE.SLATE_400}`,
  ':first-of-type': {
    border: 'none',
    borderBottom: isDesktop ? 'none' : `1px solid ${PALETTE.SLATE_400}`
  },
  ':nth-of-type(2)': {
    borderBottom: isDesktop ? 'none' : `1px solid ${PALETTE.SLATE_400}`
  },
  ':nth-of-type(3)': {
    borderLeft: isDesktop ? `1px solid ${PALETTE.SLATE_400}` : 'none'
  },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: isDesktop ? '25%' : '50%',
  paddingTop: 14,
  paddingBottom: 14
}))

const StatBlockNumber = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 40,
  lineHeight: '60px'
})

const StatBlockLabel = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '16px',
  textTransform: 'uppercase',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center'
})

const StyledIcon = styled(Info)({
  color: PALETTE.SLATE_600,
  width: 18,
  height: 18,
  paddingLeft: '4px',
  ':hover': {
    cursor: 'pointer'
  }
})

const IconBlock = styled('div')({
  display: 'flex'
})

interface Props {
  domainRef: InsightsDomainPanel_domain$key
}

const tooltipTextLookup = {
  org: 'Organizations associated with this domain that have at least 2 active members',
  team: 'Teams that met within the last 30 days and have at least 2 active members',
  member: 'Users who have logged in within the last 30 days',
  meeting: 'Total number of meetings by teams in associated organizations'
}

const InsightsDomainPanel = (props: Props) => {
  const {domainRef} = props
  const domain = useFragment(
    graphql`
      fragment InsightsDomainPanel_domain on Company {
        ...InsightsDomainNudge_domain
        id
        activeOrganizationCount
        activeTeamCount
        activeUserCount
        meetingCount
        suggestedTier
        tier
      }
    `,
    domainRef
  )
  const {
    tooltipPortal: orgPortal,
    openTooltip: orgOpenTooltip,
    closeTooltip: orgCloseTooltip,
    originRef: orgRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER)
  const {
    tooltipPortal: teamPortal,
    openTooltip: teamOpenTooltip,
    closeTooltip: teamCloseTooltip,
    originRef: teamRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER)
  const {
    tooltipPortal: memberPortal,
    openTooltip: memberOpenTooltip,
    closeTooltip: memberCloseTooltip,
    originRef: memberRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER)
  const {
    tooltipPortal: meetingPortal,
    openTooltip: meetingOpenTooltip,
    closeTooltip: meetingCloseTooltip,
    originRef: meetingRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER)
  const {
    id: domainId,
    activeOrganizationCount,
    activeTeamCount,
    activeUserCount,
    meetingCount
  } = domain

  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_SELECTOR)
  return (
    <Wrapper>
      <StatsPanel>
        <DomainName>{`${domainId} Usage`}</DomainName>
        <StatBlocks>
          <StatBlock isDesktop={isDesktop}>
            <StatBlockNumber>{activeOrganizationCount}</StatBlockNumber>
            <StatBlockLabel>
              {plural(activeOrganizationCount, 'Organization')}
              <IconBlock ref={orgRef}>
                <StyledIcon onMouseOver={orgOpenTooltip} onMouseOut={orgCloseTooltip}>
                  {'info'}
                </StyledIcon>
              </IconBlock>
            </StatBlockLabel>
            {orgPortal(tooltipTextLookup.org)}
          </StatBlock>
          <StatBlock isDesktop={isDesktop}>
            <StatBlockNumber>{activeTeamCount}</StatBlockNumber>
            <StatBlockLabel>
              {plural(activeOrganizationCount, 'Active Team')}
              <IconBlock ref={teamRef}>
                <StyledIcon onMouseOver={teamOpenTooltip} onMouseOut={teamCloseTooltip}>
                  {'info'}
                </StyledIcon>
              </IconBlock>
            </StatBlockLabel>
            {teamPortal(tooltipTextLookup.team)}
          </StatBlock>
          <StatBlock isDesktop={isDesktop}>
            <StatBlockNumber>{activeUserCount}</StatBlockNumber>
            <StatBlockLabel>
              {plural(activeOrganizationCount, 'Active Member')}
              <IconBlock ref={memberRef}>
                <StyledIcon onMouseOver={memberOpenTooltip} onMouseOut={memberCloseTooltip}>
                  {'info'}
                </StyledIcon>
              </IconBlock>
            </StatBlockLabel>
            {memberPortal(tooltipTextLookup.member)}
          </StatBlock>
          <StatBlock isDesktop={isDesktop}>
            <StatBlockNumber>{meetingCount}</StatBlockNumber>
            <StatBlockLabel>
              {plural(activeOrganizationCount, 'Total Meeting')}
              <IconBlock ref={meetingRef}>
                <StyledIcon onMouseOver={meetingOpenTooltip} onMouseOut={meetingCloseTooltip}>
                  {'info'}
                </StyledIcon>
              </IconBlock>
            </StatBlockLabel>
            {meetingPortal(tooltipTextLookup.meeting)}
          </StatBlock>
        </StatBlocks>
        <InsightsDomainNudge domainRef={domain} />
        <ExceededLimit>
          <WarningMsg>Test</WarningMsg>
          <ButtonBlock>
            <Button onClick={() => {}} palette='pink'>
              {'Upgrade'}
            </Button>
          </ButtonBlock>
        </ExceededLimit>
      </StatsPanel>
    </Wrapper>
  )
}

export default InsightsDomainPanel
