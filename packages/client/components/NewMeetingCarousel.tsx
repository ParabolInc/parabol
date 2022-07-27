import styled from '@emotion/styled'
import React from 'react'
import {FreeMode, Mousewheel} from 'swiper'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/mousewheel'
import {Swiper, SwiperSlide} from 'swiper/react'
import action from '../../../static/images/illustrations/action.png'
import retrospective from '../../../static/images/illustrations/retrospective.png'
import poker from '../../../static/images/illustrations/sprintPoker.png'
import teamPrompt from '../../../static/images/illustrations/teamPrompt.png'
import {PALETTE} from '../styles/paletteV3'
import {BezierCurve, Breakpoint, NewMeeting} from '../types/constEnums'
import {MeetingTypeEnum} from '../__generated__/NewMeetingQuery.graphql'

const MEDIA_QUERY_FUZZY_TABLET = `@media screen and (max-width: ${Breakpoint.FUZZY_TABLET}px)`

const Container = styled('div')({
  '.swiper-wrapper': {
    alignItems: 'center',
    padding: '20px 0'
  },
  marginTop: -12
})

const Title = styled('div')<{isActive: boolean}>(({isActive}) => ({
  color: isActive ? PALETTE.WHITE : PALETTE.SLATE_900,
  fontSize: 20,
  fontWeight: 600
}))

const Description = styled('div')<{isActive: boolean}>(({isActive}) => ({
  display: isActive ? 'block' : 'none',
  overflow: 'hidden',
  color: PALETTE.WHITE,
  fontSize: 12,
  [MEDIA_QUERY_FUZZY_TABLET]: {
    fontSize: 11
  }
}))

const MeetingImage = styled('img')({
  width: NewMeeting.ILLUSTRATION_WIDTH,
  objectFit: 'contain'
})

const BACKGROUND_COLORS = {
  retrospective: PALETTE.GRAPE_500,
  action: PALETTE.AQUA_400,
  poker: PALETTE.TOMATO_400,
  teamPrompt: PALETTE.JADE_300
}

const Card = styled('div')<{isActive: boolean; meetingType: keyof typeof BACKGROUND_COLORS}>(
  ({isActive, meetingType}) => ({
    background: isActive ? BACKGROUND_COLORS[meetingType] : PALETTE.SLATE_200,
    cursor: 'pointer',
    borderRadius: 4,
    marginRight: 10,
    padding: 16,
    transition: `all 200ms ${BezierCurve.DECELERATE}`,
    transform: isActive ? `scale(1.1)` : 'scale(1)'
  })
)

const ILLUSTRATIONS = {
  retrospective,
  action,
  poker,
  teamPrompt
} as Record<MeetingTypeEnum, string>

const TITLES = {
  retrospective: 'Retrospective',
  action: 'Team Check-in',
  poker: 'Sprint Poker',
  teamPrompt: 'Stand-Up'
} as Record<MeetingTypeEnum, string>

const DESCRIPTIONS = {
  retrospective: 'Improve how you work',
  action: 'Sync up, unblock each other',
  poker: 'Estimate effort, de-risk execution',
  teamPrompt: 'Stand-Up'
} as Record<MeetingTypeEnum, string>

interface Props {
  idx: number
  setIdx: (idx: number) => void
  meetingOrder: MeetingTypeEnum[]
}

const NewMeetingCarousel = (props: Props) => {
  const {idx, setIdx, meetingOrder} = props

  // TODO: remove when standups feature flag removed
  const moreThanThreeSlides = meetingOrder.length > 3

  return (
    <Container>
      <Swiper
        modules={[Mousewheel, FreeMode]}
        mousewheel={true}
        slidesOffsetBefore={24}
        slidesOffsetAfter={16}
        slideToClickedSlide={true}
        spaceBetween={16}
        threshold={10}
        slidesPerView={1.5}
        breakpoints={{
          [Breakpoint.FUZZY_TABLET]: {
            slidesPerView: moreThanThreeSlides ? 3.5 : 3.15,
            slideToClickedSlide: false,
            slidesOffsetBefore: 24,
            slidesOffsetAfter: 16
          }
        }}
        freeMode={{
          enabled: true
        }}
      >
        {meetingOrder.map((meetingType, index) => {
          const src = ILLUSTRATIONS[meetingType]
          const title = TITLES[meetingType]
          const description = DESCRIPTIONS[meetingType]
          const isActive = idx === index
          return (
            <SwiperSlide key={meetingType}>
              <Card
                isActive={isActive}
                meetingType={meetingType}
                onClick={() => {
                  setIdx(index)
                }}
              >
                <MeetingImage src={src} key={meetingType} />
                <Title isActive={isActive}>{title}</Title>
                <Description isActive={isActive}>{description}</Description>
              </Card>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </Container>
  )
}

export default NewMeetingCarousel
