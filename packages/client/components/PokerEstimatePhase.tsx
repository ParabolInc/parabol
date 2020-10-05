import React, {useRef} from 'react'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderDescription from './PhaseHeaderDescription'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import styled from '@emotion/styled'
import {Elevation} from '~/styles/elevation'
import {PALETTE} from '~/styles/paletteV2'
import Icon from './Icon'
import {ICON_SIZE} from '../styles/typographyV2'

const HeaderCard = styled('div')({
  background: '#fff',
  borderRadius: '4px',
  boxShadow: Elevation.Z3,
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  height: 86,
  padding: '12px 16px',
  position: 'absolute',
  marginTop: 12,
  width: 624
})

const CardTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '24px',
  margin: 0,
  padding: 0,
  fontWeight: 600
})

const CardIcons = styled('div')({
  display: 'flex',
  color: PALETTE.TEXT_GRAY
})

const CardTitleWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
})

const CardDescription = styled('h2')({
  color: PALETTE.TEXT_MAIN,
  fontWeight: 'normal',
  lineHeight: '20px',
  fontSize: 14,
  margin: 0,
  width: '100%'
})

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  paddingLeft: 4
})

const StyledLink = styled('span')({
  color: PALETTE.LINK_BLUE,
  cursor: 'pointer',
  lineHeight: '20px',
  display: 'flex',
  ':hover, :focus, :active': {
    color: PALETTE.LINK_BLUE_HOVER
  }
})

const StyledLabel = styled('span')({
  fontSize: 12,
  outline: 0
})

const PokerEstimatePhase = (props: any) => {
  const {avatarGroup, toggleSidebar, meeting} = props
  const phaseRef = useRef<HTMLDivElement>(null)
  const {localPhase, endedAt, showSidebar} = meeting
  if (!localPhase) return null
  return (
    <MeetingContent ref={phaseRef}>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.ESTIMATE}</PhaseHeaderTitle>
          <PhaseHeaderDescription>{'Estimate each story as a team'}</PhaseHeaderDescription>
          <HeaderCard>
            <CardTitleWrapper>
              <CardTitle>Video UX researched</CardTitle>
              <CardIcons>
                <StyledIcon>publish</StyledIcon>
                <StyledIcon>unfold_more</StyledIcon>
              </CardIcons>
            </CardTitleWrapper>
            <CardDescription>This is the first line of acceptance...</CardDescription>
            <StyledLink>
              <StyledLabel>CTD-344</StyledLabel>
              <StyledIcon>launch</StyledIcon>
            </StyledLink>
          </HeaderCard>
        </MeetingTopBar>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

export default PokerEstimatePhase
