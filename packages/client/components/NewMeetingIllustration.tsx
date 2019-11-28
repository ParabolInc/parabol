import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import {Elevation} from '../styles/elevation'
import RetroMeetingIllustration from '../../../static/images/illustrations/illus-equal-footing.png'
import ActionMeetingIllustration from '../../../static/images/illustrations/illus-momentum.png'
import {MeetingTypeEnum} from '../types/graphql'
import React from 'react'
import SwipeableViews from 'react-swipeable-views'
import {mod} from 'react-swipeable-views-core'
import {virtualize} from 'react-swipeable-views-utils'
import {NEW_MEETING_ORDER} from './NewMeeting'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'

const MeetingImage = styled('img')(({isDesktop}) => ({
  background: '#fff',
  border: `3px solid ${PALETTE.BORDER_ILLUSTRATION}`,
  borderRadius: '8px',
  boxShadow: Elevation.Z16,
  padding: 24,
  width: isDesktop ? 400 : 'calc(100% - 48px)'
}))

const Wrapper = styled('div')({
  gridRow: 2
})

interface Props {
  idx: number
  setIdx: (idx: number) => void
}

const ILLUSTRATIONS = {
  [MeetingTypeEnum.retrospective]: RetroMeetingIllustration,
  [MeetingTypeEnum.action]: ActionMeetingIllustration
}
const VirtualizeSwipeableViews = virtualize(SwipeableViews)

const TabContents = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column'
})

const NewMeetingIllustration = (props: Props) => {
  const {idx, setIdx} = props
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING)
  const slideRenderer = ({index, key}) => {
    const idx = mod(index, NEW_MEETING_ORDER.length)
    const nextMeetingType = NEW_MEETING_ORDER[idx]
    const src = ILLUSTRATIONS[nextMeetingType]
    return (
      <TabContents key={`${key}-${index}`}>
        <MeetingImage isDesktop={isDesktop} src={src} />
      </TabContents>
    )
  }

  return (
    <Wrapper>
      <VirtualizeSwipeableViews
        enableMouseEvents
        index={idx}
        onChangeIndex={setIdx}
        slideRenderer={slideRenderer}
      />
    </Wrapper>
  )
}
export default NewMeetingIllustration
