import React from 'react'
import styled from '@emotion/styled'
import {MeetingTypeEnum} from '../types/graphql'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'
import FloatingActionButton from './FloatingActionButton'
import {ICON_SIZE} from '../styles/typographyV2'
import {Breakpoint, NewMeeting} from '../types/constEnums'
import useBreakpoint from '../hooks/useBreakpoint'

interface Props {
  meetingType: MeetingTypeEnum
  idx: number
  setIdx: (idx: number) => void
}

const MeetingSelector = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  alignItems: 'center',
  display: 'flex',
  justifyContent: isDesktop ? 'center' : 'space-between',
  padding: '0 16px'
}))

const SelectArrow = styled(FloatingActionButton)({
  background: PALETTE.CONTROL_MAIN,
  color: '#fff',
  height: ICON_SIZE.MD40,
  padding: 0,
  width: ICON_SIZE.MD40
})

const MeetingTitle = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  color: PALETTE.TEXT_PURPLE,
  fontSize: isDesktop ? 34 : 27,
  fontWeight: 600,
  minWidth: isDesktop ? NewMeeting.ILLUSTRATION_WIDTH * 0.8 : undefined,
  textAlign: 'center'
}))

const TITLES = {
  [MeetingTypeEnum.retrospective]: 'Retro Meeting',
  [MeetingTypeEnum.action]: 'Check-in Meeting'
}

const NewMeetingMeetingSelector = (props: Props) => {
  const {idx, setIdx, meetingType} = props
  const title = TITLES[meetingType]
  const onPrevious = () => {
    setIdx(idx - 1)
  }
  const onNext = () => {
    setIdx(idx + 1)
  }
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_SELECTOR)
  return (
    <MeetingSelector isDesktop={isDesktop}>
      <SelectArrow onClick={onPrevious}>
        <Icon>keyboard_arrow_left</Icon>
      </SelectArrow>
      <MeetingTitle isDesktop={isDesktop}>{title}</MeetingTitle>
      <SelectArrow onClick={onNext}>
        <Icon>keyboard_arrow_right</Icon>
      </SelectArrow>
    </MeetingSelector>
  )
}

export default NewMeetingMeetingSelector
