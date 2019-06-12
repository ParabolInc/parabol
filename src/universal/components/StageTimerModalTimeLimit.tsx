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

interface Props {
  defaultTimeLimit: number
  stage: StageTimerModalTimeLimit_stage
}

const Toggle = styled(DropdownMenuToggle)({
  padding: 8,
  minWidth: 200
})

const StageTimerModalTimeLimit = (props: Props) => {
  const {defaultTimeLimit, stage} = props
  const {suggestedTimeLimit} = stage
  const initialTimeLimit = suggestedTimeLimit
    ? Math.min(10, Math.max(1, Math.round(suggestedTimeLimit / ms('1m'))))
    : defaultTimeLimit
  const [minuteTimeLimit, setMinuteTimeLimit] = useState(initialTimeLimit)
  const {menuPortal, togglePortal, menuProps: minutePickerProps, originRef} = useMenu(
    MenuPosition.LOWER_LEFT,
    {
      id: 'StageTimerMinutePicker',
      parentId: 'StageTimerModal',
      isDropdown: true
    }
  )
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
      <SecondaryButton>{'Start Timer'}</SecondaryButton>
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
