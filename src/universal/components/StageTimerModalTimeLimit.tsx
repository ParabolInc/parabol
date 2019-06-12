import plural from 'universal/utils/plural'
import StageTimerMinutePicker from 'universal/components/StageTimerMinutePicker'
import SecondaryButton from 'universal/components/SecondaryButton'
import React, {useState} from 'react'
import useMenu from 'universal/hooks/useMenu'
import {MenuPosition} from 'universal/hooks/useCoords'
import {createFragmentContainer, graphql} from 'react-relay'
import styled from 'react-emotion'
import DropdownMenuToggle from 'universal/components/DropdownMenuToggle'
import {StageTimerModalTimeLimit_stage} from '__generated__/StageTimerModalTimeLimit_stage.graphql'
import ms from 'ms'
import SetStageTimerMutation from 'universal/mutations/SetStageTimerMutation'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useMutationProps from 'universal/hooks/useMutationProps'
import StyledError from 'universal/components/StyledError'

interface Props {
  closePortal: () => void
  defaultTimeLimit: number
  meetingId: string
  stage: StageTimerModalTimeLimit_stage
}

const Toggle = styled(DropdownMenuToggle)({
  padding: 8,
  minWidth: 200
})

const StageTimerModalTimeLimit = (props: Props) => {
  const {closePortal, defaultTimeLimit, meetingId, stage} = props
  const {suggestedTimeLimit} = stage
  const initialTimeLimit = suggestedTimeLimit
    ? Math.min(10, Math.max(1, Math.round(suggestedTimeLimit / ms('1m'))))
    : defaultTimeLimit
  const atmosphere = useAtmosphere()
  const [minuteTimeLimit, setMinuteTimeLimit] = useState(initialTimeLimit)
  const {menuPortal, togglePortal, menuProps: minutePickerProps, originRef} = useMenu(
    MenuPosition.LOWER_LEFT,
    {
      id: 'StageTimerMinutePicker',
      parentId: 'StageTimerModal',
      isDropdown: true
    }
  )
  const {submitting, onError, onCompleted, submitMutation, error} = useMutationProps()
  const startTimer = () => {
    if (submitting) return
    const timeRemaining = minuteTimeLimit * ms('1m')
    const scheduledEndTime = new Date(Date.now() + timeRemaining)
    submitMutation()
    SetStageTimerMutation(
      atmosphere,
      {meetingId, timeRemaining, scheduledEndTime},
      {onError, onCompleted}
    )
    closePortal()
  }

  return (
    <>
      <Toggle
        defaultText={`${minuteTimeLimit} ${plural(minuteTimeLimit, 'minute')}`}
        onClick={togglePortal}
        innerRef={originRef}
      />
      {menuPortal(
        <StageTimerMinutePicker
          minuteTimeLimit={minuteTimeLimit}
          menuProps={minutePickerProps}
          setMinuteTimeLimit={setMinuteTimeLimit}
        />
      )}
      <SecondaryButton onClick={startTimer}>{'Start Timer'}</SecondaryButton>
      {error && <StyledError>{error}</StyledError>}
    </>
  )
}

export default createFragmentContainer(
  StageTimerModalTimeLimit,
  graphql`
    fragment StageTimerModalTimeLimit_stage on NewMeetingStage {
      suggestedTimeLimit
    }
  `
)
