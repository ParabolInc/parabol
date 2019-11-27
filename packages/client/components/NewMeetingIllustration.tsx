import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV2'
import {Elevation} from '../styles/elevation'
import RetroMeetingIllustration from '../../../static/images/illustrations/illus-equal-footing.png'
import {MeetingTypeEnum} from '../types/graphql'
import React from 'react'

const MeetingImage = styled('img')({
  gridRow: '2/3',
  background: '#fff',
  border: `3px solid ${PALETTE.BORDER_ILLUSTRATION}`,
  borderRadius: '8px',
  boxShadow: Elevation.Z16,
  width: 576,
  height: 324
})

interface Props {
  meetingType: MeetingTypeEnum
}

const NewMeetingIllustration = (props: Props) => {
  const {meetingType} = props
  console.log('meetingType', meetingType)
  return <MeetingImage src={RetroMeetingIllustration} />
}
export default NewMeetingIllustration
