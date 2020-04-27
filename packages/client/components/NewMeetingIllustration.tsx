import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import {Elevation} from '../styles/elevation'
import {MeetingTypeEnum} from '../types/graphql'
import React, {Fragment} from 'react'
import SwipeableViews from 'react-swipeable-views'
import {mod} from 'react-swipeable-views-core'
import {virtualize} from 'react-swipeable-views-utils'
import {NEW_MEETING_ORDER} from './NewMeeting'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint, NewMeeting} from '../types/constEnums'

const MeetingImage = styled('img')({
  width: NewMeeting.ILLUSTRATION_WIDTH
})

interface Props {
  idx: number
  setIdx: (idx: number) => void
}

const ILLUSTRATIONS = {
  [MeetingTypeEnum.retrospective]: `${__STATIC_IMAGES__}/illustrations/meeting_types-retro.svg`,
  [MeetingTypeEnum.action]: `${__STATIC_IMAGES__}/illustrations/meeting_types-check_in.svg`
}
const VirtualizeSwipeableViews = virtualize(SwipeableViews)

const TabContents = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: isDesktop ? 32 : undefined,
  paddingTop: isDesktop ? 16 : undefined
}))

const ImageWithPadding = styled('div')({
  background: '#fff',
  border: `3px solid ${PALETTE.BORDER_ILLUSTRATION}`,
  boxShadow: Elevation.Z12,
  borderRadius: '8px',
  padding: '0 64px'
})

const NewMeetingIllustration = (props: Props) => {
  const {idx, setIdx} = props
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_GRID)
  const slideRenderer = ({index, key}) => {
    const idx = mod(index, NEW_MEETING_ORDER.length)
    const nextMeetingType = NEW_MEETING_ORDER[idx]
    const src = ILLUSTRATIONS[nextMeetingType]
    const Wrapper = isDesktop ? ImageWithPadding : Fragment
    return (
      <TabContents isDesktop={isDesktop} key={`${key}-${index}`}>
        <Wrapper>
          <MeetingImage src={src} />
        </Wrapper>
      </TabContents>
    )
  }

  return (
    <VirtualizeSwipeableViews
      enableMouseEvents
      index={idx}
      onChangeIndex={setIdx}
      slideRenderer={slideRenderer}
      // offset the 16px padding from the child for the box shadow
      style={{marginTop: -16}}
    />
  )
}
export default NewMeetingIllustration
