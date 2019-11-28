import React from 'react'
import styled from '@emotion/styled'
import {MeetingTypeEnum} from '../types/graphql'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'
import FloatingActionButton from './FloatingActionButton'
import {ICON_SIZE} from '../styles/typographyV2'

interface Props {
  meetingType: MeetingTypeEnum
  idx: number
  setIdx: (idx: number) => void
}

const MeetingSelector = styled('div')({
  display: 'flex',
  justifyContent: 'space-evenly',
  paddingBottom: 32
})

const SelectArrow = styled(FloatingActionButton)({
  background: PALETTE.CONTROL_MAIN,
  color: '#fff',
  height: ICON_SIZE.MD40,
  padding: 0,
  width: ICON_SIZE.MD40
})

const MeetingTitle = styled('div')({
  color: PALETTE.TEXT_PURPLE,
  fontSize: 36,
  fontWeight: 600,
  minWidth: 384,
  textAlign: 'center'
})

const TITLES = {
  [MeetingTypeEnum.retrospective]: 'Retrospective Meeting',
  [MeetingTypeEnum.action]: 'Action Meeting'
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
  return (
    <MeetingSelector>
      <SelectArrow onClick={onPrevious}>
        <Icon>keyboard_arrow_left</Icon>
      </SelectArrow>
      <MeetingTitle>{title}</MeetingTitle>
      <SelectArrow onClick={onNext}>
        <Icon>keyboard_arrow_right</Icon>
      </SelectArrow>
    </MeetingSelector>
  )
}

export default NewMeetingMeetingSelector
