import styled from '@emotion/styled'
import React, {Fragment} from 'react'
import SwipeableViews from 'react-swipeable-views'
import {mod} from 'react-swipeable-views-core'
import {virtualize} from 'react-swipeable-views-utils'
import {NonEmptyArray} from '~/types/generics'
import {MeetingTypeEnum} from '~/__generated__/NewMeetingQuery.graphql'
import action from '../../../static/images/illustrations/action.png'
import retrospective from '../../../static/images/illustrations/retrospective.png'
import poker from '../../../static/images/illustrations/sprintPoker.png'
import teamPrompt from '../../../static/images/illustrations/teamPrompt.png'
import useBreakpoint from '../hooks/useBreakpoint'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {Breakpoint, NewMeeting} from '../types/constEnums'

const MeetingImage = styled('img')({
  width: NewMeeting.ILLUSTRATION_WIDTH,
  objectFit: 'contain'
})

interface Props {
  idx: number
  setIdx: (idx: number) => void
  newMeetingOrder: Readonly<NonEmptyArray<MeetingTypeEnum>>
}

const ILLUSTRATIONS = {
  retrospective,
  action,
  poker,
  teamPrompt
} as Record<MeetingTypeEnum, string>

const VirtualizeSwipeableViews = virtualize(SwipeableViews)

const TabContents = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  padding: isDesktop ? 32 : undefined,
  paddingTop: isDesktop ? 16 : undefined
}))

const BACKGROUND_COLORS = {
  retrospective: PALETTE.GRAPE_500,
  action: PALETTE.AQUA_400,
  poker: PALETTE.TOMATO_400,
  teamPrompt: PALETTE.JADE_300
}

const ImageWithPadding = styled.div<{meetingType: keyof typeof BACKGROUND_COLORS}>(
  ({meetingType}) => ({
    background: BACKGROUND_COLORS[meetingType],
    boxShadow: Elevation.Z12,
    borderRadius: '4px',
    display: 'flex',
    height: 300,
    padding: '0 64px'
  })
)

const NewMeetingIllustration = (props: Props) => {
  const {idx, setIdx, newMeetingOrder} = props
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_GRID)
  const slideRenderer = ({index, key}) => {
    const idx = mod(index, newMeetingOrder.length)
    const nextMeetingType = newMeetingOrder[idx]!
    const src = ILLUSTRATIONS[nextMeetingType]
    const Wrapper = isDesktop ? ImageWithPadding : Fragment
    return (
      <TabContents isDesktop={isDesktop} key={`${key}-${index}`}>
        <Wrapper meetingType={nextMeetingType}>
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
