import styled from '@emotion/styled'
import React from 'react'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint} from '../../../../types/constEnums'

const StyledPanel = styled(Panel)({
  maxWidth: 800
})

const StyledRow = styled(Row)({
  padding: '12px 8px 12px 16px'
})

const StatBlocks = styled('div')({
  display: 'flex',
  width: '100%',
  flexWrap: 'wrap'
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
  width: '33.33%',
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
  textTransform: 'capitalize',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center'
})

const OrgPlans = () => {
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_SELECTOR)
  return (
    <StyledPanel label='Plans'>
      <StyledRow>
        <StatBlocks>
          <StatBlock isDesktop={isDesktop}>
            <StatBlockNumber>{'18'}</StatBlockNumber>
            <StatBlockLabel>{'Organization'}</StatBlockLabel>
          </StatBlock>
          <StatBlock isDesktop={isDesktop}>
            <StatBlockNumber>{'18'}</StatBlockNumber>
            <StatBlockLabel>{'Active Team'}</StatBlockLabel>
          </StatBlock>
          <StatBlock isDesktop={isDesktop}>
            <StatBlockNumber>{'18'}</StatBlockNumber>
            <StatBlockLabel>{'Active Member'}</StatBlockLabel>
          </StatBlock>
        </StatBlocks>
      </StyledRow>
    </StyledPanel>
  )
}

export default OrgPlans
