import React from 'react'
import styled from '@emotion/styled'
import {MeetingTypeEnum} from '../types/graphql'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'
import FloatingActionButton from './FloatingActionButton'
import {ICON_SIZE} from '../styles/typographyV2'

interface Props {
  meetingType: MeetingTypeEnum
  setMeetingType: (meetingType: MeetingTypeEnum) => void
}

const MeetingSelector = styled('div')({
  display: 'flex',
  justifyContent: 'space-evenly',
  paddingBottom: 32
})

const SelectPrevious = styled(FloatingActionButton)({
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

const NewMeetingMeetingSelector = (_props: Props) => {
  return (
    <MeetingSelector>
      <SelectPrevious>
        <Icon>keyboard_arrow_left</Icon>
      </SelectPrevious>
      <MeetingTitle>Retrospective Meeting</MeetingTitle>
      <SelectPrevious>
        <Icon>keyboard_arrow_right</Icon>
      </SelectPrevious>
    </MeetingSelector>
  )
}

export default NewMeetingMeetingSelector
