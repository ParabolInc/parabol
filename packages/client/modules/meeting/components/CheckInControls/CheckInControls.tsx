import {CheckInControls_teamMember} from '../../../../__generated__/CheckInControls_teamMember.graphql'
import React, {Ref, useRef} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import BottomNavControl from '../../../../components/BottomNavControl'
import BottomNavIconLabel from '../../../../components/BottomNavIconLabel'
import {useGotoNext} from '../../../../hooks/useMeeting'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import useHotkey from '../../../../hooks/useHotkey'
import useTimeout from '../../../../hooks/useTimeout'
import NewMeetingCheckInMutation from '../../../../mutations/NewMeetingCheckInMutation'
import handleRightArrow from '../../../../utils/handleRightArrow'
import useEventCallback from '../../../../hooks/useEventCallback'
import {END_MEETING_BUTTON} from '../../../../components/EndMeetingButton'
import {Breakpoint} from '../../../../types/constEnums'

const ButtonBlock = styled('div')({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  marginLeft: END_MEETING_BUTTON.WIDTH // width of end meeting button,
})

interface Props {
  handleGotoNext: ReturnType<typeof useGotoNext>
  teamMember: CheckInControls_teamMember
  endMeetingButtonRef: Ref<HTMLButtonElement>
}

const CheckInControls = (props: Props) => {
  const {teamMember, handleGotoNext} = props
  const {preferredName} = teamMember
  const atmosphere = useAtmosphere()
  const teamMemberRef = useRef(teamMember)
  const handleGotoNextRef = useRef(handleGotoNext)
  teamMemberRef.current = teamMember
  handleGotoNextRef.current = handleGotoNext
  const handleOnClickPresent = useEventCallback(() => {
    const {userId, meetingMember} = teamMemberRef.current
    const {isCheckedIn, meetingId} = meetingMember!
    if (!isCheckedIn) {
      NewMeetingCheckInMutation(atmosphere, {meetingId, userId, isCheckedIn: true})
    }
    handleGotoNextRef.current && handleGotoNextRef.current.gotoNext()
  })

  const handleOnClickAbsent = useEventCallback(() => {
    const {userId, meetingMember} = teamMemberRef.current
    const {isCheckedIn, meetingId} = meetingMember!
    if (isCheckedIn !== false) {
      NewMeetingCheckInMutation(atmosphere, {meetingId, userId, isCheckedIn: false})
    }
    handleGotoNextRef.current && handleGotoNextRef.current.gotoNext()
  })

  useHotkey('h', handleOnClickPresent)
  useHotkey('n', handleOnClickAbsent)
  const isReadyForNext = useTimeout(30000)
  const isMobile = !useBreakpoint(Breakpoint.MEETING_FACILITATOR_BAR)
  const nextLabel = isMobile ? 'Here' : `${preferredName} is Here`
  const skipLabel = isMobile ? 'Not Here' : `${preferredName} is Not Here`
  const Wrapper = isMobile ? React.Fragment : ButtonBlock
  return (
    <Wrapper>
      <BottomNavControl
        isBouncing={isReadyForNext}
        aria-label={`Mark ${preferredName} as “here” and move on`}
        onClick={handleOnClickPresent}
        onKeyDown={handleRightArrow(handleOnClickPresent)}
        ref={handleGotoNext.ref}
      >
        <BottomNavIconLabel icon='check_circle' iconColor='green' label={nextLabel} />
      </BottomNavControl>
      <BottomNavControl
        aria-label={`Mark ${preferredName} as “not here” and move on`}
        size='medium'
        onClick={handleOnClickAbsent}
      >
        <BottomNavIconLabel icon='remove_circle' iconColor='red' label={skipLabel} />
      </BottomNavControl>
    </Wrapper>
  )
}

export default createFragmentContainer(CheckInControls, {
  teamMember: graphql`
    fragment CheckInControls_teamMember on TeamMember {
      meetingMember {
        meetingId
        isCheckedIn
      }
      preferredName
      userId
    }
  `
})
