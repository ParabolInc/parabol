import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import plural from '../utils/plural'
import {InsightsDomainPanel_domain$key} from '../__generated__/InsightsDomainPanel_domain.graphql'
import InsightsDomainNudge from './InsightsDomainNudge'
import Panel from './Panel/Panel'

const StatsPanel = styled(Panel)({
  boxShadow: Elevation.Z3,
  maxWidth: 520
})

const Wrapper = styled('div')({
  paddingLeft: 16
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
  ':first-child': {
    border: 'none'
  },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
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
  textTransform: 'uppercase'
})

interface Props {
  domainRef: InsightsDomainPanel_domain$key
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
            <StatBlockLabel>{plural(activeOrganizationCount, 'Organization')}</StatBlockLabel>
          </StatBlock>
          <StatBlock>
            <StatBlockNumber>{activeTeamCount}</StatBlockNumber>
            <StatBlockLabel>{plural(activeOrganizationCount, 'Active Team')}</StatBlockLabel>
          </StatBlock>
          <StatBlock>
            <StatBlockNumber>{activeUserCount}</StatBlockNumber>
            <StatBlockLabel>{plural(activeUserCount, 'Active Member')}</StatBlockLabel>
          </StatBlock>
          <StatBlock>
            <StatBlockNumber>{meetingCount}</StatBlockNumber>
            <StatBlockLabel>{plural(meetingCount, 'Meeting')}</StatBlockLabel>
          </StatBlock>
        </StatBlocks>
        <InsightsDomainNudge domainRef={domain} />
      </StatsPanel>
    </Wrapper>
  )
}

export default InsightsDomainPanel
