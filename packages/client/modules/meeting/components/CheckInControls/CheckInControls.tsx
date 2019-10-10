import {CheckInControls_teamMember} from '../../../../__generated__/CheckInControls_teamMember.graphql'
import React, {useRef} from 'react'
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
import {Breakpoint, ElementWidth} from '../../../../types/constEnums'

const ButtonBlock = styled('div')({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  marginLeft: ElementWidth.END_MEETING_BUTTON
})

const NotHereButton = styled(BottomNavControl)<{isMobile: boolean}>(({isMobile}) => ({
  width: isMobile ? ElementWidth.END_MEETING_BUTTON : undefined
}))

interface Props {
  handleGotoNext: ReturnType<typeof useGotoNext>
  teamMember: CheckInControls_teamMember
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
      <NotHereButton
        isMobile={isMobile}
        aria-label={`Mark ${preferredName} as “not here” and move on`}
        size='medium'
        onClick={handleOnClickAbsent}
      >
        <BottomNavIconLabel icon='remove_circle' iconColor='red' label={skipLabel} />
      </NotHereButton>
      <BottomNavControl
        isBouncing={isReadyForNext}
        aria-label={`Mark ${preferredName} as “here” and move on`}
        onClick={handleOnClickPresent}
        onKeyDown={handleRightArrow(handleOnClickPresent)}
        ref={handleGotoNext.ref}
      >
        <BottomNavIconLabel icon='check_circle' iconColor='green' label={nextLabel} />
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
