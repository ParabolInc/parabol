import React from 'react'
import styled from '@emotion/styled'
import {MeetingTypeEnum} from '../types/graphql'
import RetroMeetingIllustration from '../../../static/images/illustrations/illus-equal-footing.png'
import {PALETTE} from '../styles/paletteV2'
import {Elevation} from '../styles/elevation'
import Icon from './Icon'
import FloatingActionButton from './FloatingActionButton'
import {ICON_SIZE} from '../styles/typographyV2'

const SelectorBlock = styled('div')({})

interface Props {
  meetingType: MeetingTypeEnum
  setMeetingType: (meetingType: MeetingTypeEnum) => void
}

const MeetingImage = styled('img')({
  background: '#fff',
  border: `3px solid ${PALETTE.BORDER_ILLUSTRATION}`,
  borderRadius: '8px',
  boxShadow: Elevation.Z16,
  width: 576,
  height: 324
})

const MeetingSelector = styled('div')({
  display: 'flex',
  justifyContent: 'space-evenly',
  paddingTop: 32
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
    <SelectorBlock>
      <MeetingImage src={RetroMeetingIllustration} />
      <MeetingSelector>
        <SelectPrevious>
          <Icon>keyboard_arrow_left</Icon>
        </SelectPrevious>
        <MeetingTitle>Retrospective Meeting</MeetingTitle>
        <SelectPrevious>
          <Icon>keyboard_arrow_right</Icon>
        </SelectPrevious>
      </MeetingSelector>
    </SelectorBlock>
  )
}

export default NewMeetingMeetingSelector
