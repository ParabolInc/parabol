import styled from '@emotion/styled'
import React, {useRef, useState} from 'react'
import {MeetingTypeEnum} from '~/__generated__/NewMeetingQuery.graphql'
import useBreakpoint from '../hooks/useBreakpoint'
import {BezierCurve, Breakpoint} from '../types/constEnums'
import ExpansionPanelSummary from './ExpansionPanelSummary'
import NewMeetingHowToSteps from './NewMeetingHowToSteps'

interface Props {
  meetingType: MeetingTypeEnum
}

const Parent = styled('div')<{isDesktop?: boolean}>(({isDesktop}) => ({
  gridArea: 'howto',
  maxWidth: isDesktop ? undefined : 424,
  margin: isDesktop ? undefined : '0 auto',
  paddingLeft: isDesktop ? '32px' : undefined
}))

const ExpansionPanelBody = styled('div')<{bodyHeight: number}>(({bodyHeight}) => ({
  height: bodyHeight,
  justifyContent: 'center',
  overflow: 'hidden',
  padding: '0 16px',
  transition: `height 600ms ${BezierCurve.DECELERATE}`,
  width: '100%'
}))

const NewMeetingHowTo = (props: Props) => {
  const {meetingType} = props
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_GRID)
  const [bodyHeight, setBodyHeight] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const toggleExpansionPanel = () => {
    const nextHeight = (bodyHeight === 0 && ref.current?.scrollHeight) || 0
    setBodyHeight(nextHeight)
  }
  if (isDesktop) {
    return (
      <Parent isDesktop>
        <NewMeetingHowToSteps meetingType={meetingType} showTitle />
      </Parent>
    )
  }
  return (
    <Parent>
      <ExpansionPanelSummary
        label={'How to Run'}
        onClick={toggleExpansionPanel}
        isExpanded={bodyHeight > 0}
      />
      <ExpansionPanelBody bodyHeight={bodyHeight} ref={ref}>
        <NewMeetingHowToSteps meetingType={meetingType} />
      </ExpansionPanelBody>
    </Parent>
  )
}

export default NewMeetingHowTo
