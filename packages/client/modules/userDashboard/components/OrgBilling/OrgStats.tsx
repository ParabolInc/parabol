import styled from '@emotion/styled'
import {Info} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {OrgStats_organization$key} from '../../../../__generated__/OrgStats_organization.graphql'
import {tooltipTextLookup} from '../../../../components/InsightsDomainPanel'
import {MenuPosition} from '../../../../hooks/useCoords'
import useTooltip from '../../../../hooks/useTooltip'
import {PALETTE} from '../../../../styles/paletteV3'

const StatBlocks = styled('div')({
  display: 'flex',
  width: '100%',
  padding: '8px 0px'
})

const StatBlock = styled('div')({
  borderLeft: `1px solid ${PALETTE.SLATE_400}`,
  ':first-of-type': {
    borderLeft: 'none'
  },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '50%',
  padding: '14px 0px'
})

const StatBlockNumber = styled('h5')({
  color: PALETTE.SLATE_600,
  fontSize: 48,
  fontWeight: 500,
  lineHeight: '72px',
  margin: 0
})

const StatBlockLabel = styled('label')({
  color: PALETTE.SLATE_800,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '16px',
  textTransform: 'capitalize',
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'center',
  textAlign: 'center'
})

const StyledIcon = styled('span')({
  width: 18,
  height: 18,
  color: PALETTE.SLATE_600,
  paddingLeft: 8,
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    cursor: 'pointer'
  }
})

const IconBlock = styled('div')({
  display: 'flex'
})

type Props = {
  organizationRef: OrgStats_organization$key
}

const OrgStats = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgStats_organization on Organization {
        orgUserCount {
          activeUserCount
        }
        activeTeamCount
      }
    `,
    organizationRef
  )
  const {activeTeamCount, orgUserCount} = organization
  const {activeUserCount} = orgUserCount
  const {
    tooltipPortal: teamsPortal,
    openTooltip: teamsOpenTooltip,
    closeTooltip: teamsCloseTooltip,
    originRef: teamsRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER)

  const {
    tooltipPortal: membersPortal,
    openTooltip: membersOpenTooltip,
    closeTooltip: membersCloseTooltip,
    originRef: membersRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER)

  return (
    <StatBlocks>
      <StatBlock>
        <StatBlockNumber>
          {activeTeamCount}
          <IconBlock ref={teamsRef}></IconBlock>
        </StatBlockNumber>
        <StatBlockLabel>
          {'Active Teams'}
          <StyledIcon ref={teamsRef} onMouseOver={teamsOpenTooltip} onMouseOut={teamsCloseTooltip}>
            {<Info />}
          </StyledIcon>
        </StatBlockLabel>
        {teamsPortal(tooltipTextLookup.team)}
      </StatBlock>
      <StatBlock>
        <StatBlockNumber>
          {activeUserCount}
          <IconBlock></IconBlock>
        </StatBlockNumber>
        <StatBlockLabel>
          {'Active Members'}
          <StyledIcon
            ref={membersRef}
            onMouseOver={membersOpenTooltip}
            onMouseOut={membersCloseTooltip}
          >
            {<Info />}
          </StyledIcon>
        </StatBlockLabel>
        {membersPortal(tooltipTextLookup.member)}
      </StatBlock>
    </StatBlocks>
  )
}

export default OrgStats
