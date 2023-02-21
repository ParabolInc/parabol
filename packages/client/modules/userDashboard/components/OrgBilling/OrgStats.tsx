import styled from '@emotion/styled'
import {Info} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {tooltipTextLookup} from '../../../../components/InsightsDomainPanel'
import {MenuPosition} from '../../../../hooks/useCoords'
import useTooltip from '../../../../hooks/useTooltip'
import {PALETTE} from '../../../../styles/paletteV3'
import {OrgStats_organization$key} from '../../../../__generated__/OrgStats_organization.graphql'

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
  width: '33.33%',
  padding: '14px 0px'
})

const StatBlockNumber = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 40,
  lineHeight: '60px'
})

const StatBlockLabel = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 14,
  fontWeight: 600,
  lineHeight: '16px',
  textTransform: 'capitalize',
  display: 'flex',
  alignItems: 'center'
})

const StyledIcon = styled('div')({
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
        totalMeetingCount
        activeTeamCount
      }
    `,
    organizationRef
  )
  const {activeTeamCount, orgUserCount, totalMeetingCount} = organization
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
      <StatBlock>
        <StatBlockNumber>
          {totalMeetingCount}
          <IconBlock></IconBlock>
        </StatBlockNumber>
        <StatBlockLabel>{'Total Meetings'}</StatBlockLabel>
      </StatBlock>
    </StatBlocks>
  )
}

export default OrgStats
