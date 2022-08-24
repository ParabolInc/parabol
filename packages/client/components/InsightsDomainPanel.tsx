import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MenuPosition} from '../hooks/useCoords'
import useTooltip from '../hooks/useTooltip'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import plural from '../utils/plural'
import {InsightsDomainPanel_domain$key} from '../__generated__/InsightsDomainPanel_domain.graphql'
import Icon from './Icon'
import InsightsDomainNudge from './InsightsDomainNudge'
import Panel from './Panel/Panel'

const StatsPanel = styled(Panel)({
  boxShadow: Elevation.Z3,
  maxWidth: 520
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

const StatBlocks = styled('div')({
  display: 'flex',
  borderTop: `1px solid ${PALETTE.SLATE_400}`,
  width: '100%'
})

const StatBlock = styled('div')({
  borderLeft: `1px solid ${PALETTE.SLATE_400}`,
  ':first-of-type': {
    border: 'none'
  },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '25%',
  paddingTop: 14,
  paddingBottom: 14
})

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

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD18,
  paddingLeft: '4px',
  ':hover': {
    cursor: 'pointer'
  }
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

  return (
    <Wrapper>
      <StatsPanel>
        <DomainName>{domainId}</DomainName>
        <StatBlocks>
          <StatBlock>
            <StatBlockNumber>{activeOrganizationCount}</StatBlockNumber>
            <StatBlockLabel ref={orgRef}>
              {plural(activeOrganizationCount, 'Organization')}
              <StyledIcon onMouseOver={orgOpenTooltip} onMouseOut={orgCloseTooltip}>
                {'info'}
              </StyledIcon>
            </StatBlockLabel>
            {orgPortal(tooltipTextLookup.org)}
          </StatBlock>
          <StatBlock>
            <StatBlockNumber>{activeTeamCount}</StatBlockNumber>
            <StatBlockLabel ref={teamRef}>
              {plural(activeOrganizationCount, 'Active Team')}
              <StyledIcon onMouseOver={teamOpenTooltip} onMouseOut={teamCloseTooltip}>
                {'info'}
              </StyledIcon>
            </StatBlockLabel>
            {teamPortal(tooltipTextLookup.team)}
          </StatBlock>
          <StatBlock>
            <StatBlockNumber>{activeUserCount}</StatBlockNumber>
            <StatBlockLabel ref={memberRef}>
              {plural(activeOrganizationCount, 'Active Member')}
              <StyledIcon onMouseOver={memberOpenTooltip} onMouseOut={memberCloseTooltip}>
                {'info'}
              </StyledIcon>
            </StatBlockLabel>
            {memberPortal(tooltipTextLookup.member)}
          </StatBlock>
          <StatBlock>
            <StatBlockNumber>{meetingCount}</StatBlockNumber>
            <StatBlockLabel ref={meetingRef}>
              {plural(activeOrganizationCount, 'Total Meeting')}
              <StyledIcon onMouseOver={meetingOpenTooltip} onMouseOut={meetingCloseTooltip}>
                {'info'}
              </StyledIcon>
            </StatBlockLabel>
            {meetingPortal(tooltipTextLookup.meeting)}
          </StatBlock>
        </StatBlocks>
        <InsightsDomainNudge domainRef={domain} />
      </StatsPanel>
    </Wrapper>
  )
}

export default InsightsDomainPanel
