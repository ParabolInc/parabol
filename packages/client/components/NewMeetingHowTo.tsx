import React from 'react'
import {MeetingTypeEnum} from '../types/graphql'
import NewMeetingHowToRetrospective from './NewMeetingHowToRetrospective'
import NewMeetingHowToAction from './NewMeetingHowToAction'
import styled from '@emotion/styled'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'

interface Props {
  meetingType: MeetingTypeEnum
}

const howToLookup = {
  [MeetingTypeEnum.action]: NewMeetingHowToAction,
  [MeetingTypeEnum.retrospective]: NewMeetingHowToRetrospective
}

const Parent = styled('div')({
  // make it wider than any child so there's no movement between changes
  minWidth: 400
})

const NewMeetingHowTo = (props: Props) => {
  const {meetingType} = props
  const HowTo = howToLookup[meetingType]
  return (
    <Parent>
      <HowTo />
    </Parent>
  )
}

export default NewMeetingHowTo
