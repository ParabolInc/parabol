import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {PALETTE} from '../styles/paletteV3'
import {Layout} from '../types/constEnums'
import {InsightsDomainPanel_domain$key} from '../__generated__/InsightsDomainPanel_domain.graphql'
import Panel from './Panel/Panel'

const StatsPanel = styled(Panel)({
  maxWidth: 800
})

const Wrapper = styled('div')({
  maxWidth: Layout.SETTINGS_MAX_WIDTH,
  margin: '0 auto',
  width: '100%'
})

const DomainName = styled('div')({
  fontSize: 32,
  fontWeight: 600,
  padding: 16
})

const StatBlocks = styled('div')({
  display: 'flex'
})

const StatBlock = styled('div')({
  borderTop: '1px solid gray',
  borderBottom: '1px solid gray'
})

const StatBlockNumber = styled('div')({
  fontColor: PALETTE.SLATE_400,
  fontSize: 28
})

const StatBlockLabel = styled('div')({
  fontColor: PALETTE.SLATE_800,
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
        id
        activeOrganizationCount
        activeTeamCount
        activeUserCount
        meetingCount
      }
    `,
    domainRef
  )
  const {
    id: domainId
    // activeOrganizationCount,
    // activeTeamCount,
    // activeUserCount,
    // meetingCount
  } = domain
  return (
    <Wrapper>
      <StatsPanel label={'Domain Stats'}>
        <DomainName>{domainId}</DomainName>
        <StatBlocks>
          <StatBlock>
            <StatBlockNumber>4</StatBlockNumber>
            <StatBlockLabel>Organizations</StatBlockLabel>
          </StatBlock>
        </StatBlocks>
      </StatsPanel>
    </Wrapper>
  )
}

export default InsightsDomainPanel
