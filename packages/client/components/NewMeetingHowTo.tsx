import styled from '@emotion/styled'
import React from 'react'
import {MeetingTypeEnum} from '~/__generated__/NewMeetingQuery.graphql'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint} from '../types/constEnums'
import NewMeetingHowToSteps from './NewMeetingHowToSteps'

interface Props {
  meetingType: MeetingTypeEnum
}

const Parent = styled('div')({
  gridArea: 'howto',
  paddingLeft: '32px'
})

const NewMeetingHowTo = (props: Props) => {
  const {meetingType} = props
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_GRID)
  if (isDesktop) {
    return (
      <Parent>
        <NewMeetingHowToSteps meetingType={meetingType} showTitle />
      </Parent>
    )
  }
  return null
}

export default NewMeetingHowTo
