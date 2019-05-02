import {CheckInControls_teamMember} from '__generated__/CheckInControls_teamMember.graphql'
import React, {useCallback} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import BottomNavControl from 'universal/components/BottomNavControl'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import {MEETING_SIDEBAR} from 'universal/components/NewMeetingSidebar'
import {useGotoNext} from 'universal/hooks/newMeeting'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useBreakpoint from 'universal/hooks/useBreakpoint'
import useHotkey from 'universal/hooks/useHotkey'
import useTimeout from 'universal/hooks/useTimeout'
import NewMeetingCheckInMutation from 'universal/mutations/NewMeetingCheckInMutation'
import handleRightArrow from 'universal/utils/handleRightArrow'

const ButtonBlock = styled('div')({
  display: 'flex'
})

interface Props {
  handleGotoNext: ReturnType<typeof useGotoNext>
  teamMember: CheckInControls_teamMember
}

const CheckInControls = (props: Props) => {
  const {teamMember, handleGotoNext} = props
  const {preferredName, userId, meetingMember} = teamMember
  const {isCheckedIn, meetingId} = meetingMember!
  const atmosphere = useAtmosphere()

  const handleOnClickPresent = useCallback(() => {
    if (!isCheckedIn) {
      NewMeetingCheckInMutation(atmosphere, {meetingId, userId, isCheckedIn: true})
    }
    handleGotoNext.current.gotoNext()
  }, [userId, isCheckedIn])

  const handleOnClickAbsent = useCallback(() => {
    if (!isCheckedIn) {
      NewMeetingCheckInMutation(atmosphere, {meetingId, userId, isCheckedIn: true})
    }
    handleGotoNext.current.gotoNext()
  }, [userId, isCheckedIn])

  useHotkey('h', handleOnClickPresent)
  useHotkey('n', handleOnClickAbsent)
  const isReadyForNext = useTimeout(30000)
  const isSmallerBreakpoint = !useBreakpoint(MEETING_SIDEBAR.BREAKPOINT)
  const nextLabel = isSmallerBreakpoint ? 'Here' : `${preferredName} is Here`
  const skipLabel = isSmallerBreakpoint ? 'Not Here' : `${preferredName} is Not Here`
  return (
    <ButtonBlock>
      <BottomNavControl
        isBouncing={isReadyForNext}
        aria-label={`Mark ${preferredName} as “here” and move on`}
        onClick={handleOnClickPresent}
        onKeyDown={handleRightArrow(handleOnClickPresent)}
        innerRef={handleGotoNext.current.ref}
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
    </ButtonBlock>
  )
}

export default createFragmentContainer(
  CheckInControls,
  graphql`
    fragment CheckInControls_teamMember on TeamMember {
      meetingMember {
        meetingId
        isCheckedIn
      }
      preferredName
      userId
    }
  `
)
