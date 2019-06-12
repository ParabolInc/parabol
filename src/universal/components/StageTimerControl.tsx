import React from 'react'
import BottomNavIconLabel from 'universal/components/BottomNavIconLabel'
import BottomNavControl from 'universal/components/BottomNavControl'
import {createFragmentContainer, graphql} from 'react-relay'
import {StageTimerControl_stage} from '__generated__/StageTimerControl_stage.graphql'
import useMenu from 'universal/hooks/useMenu'
import {MenuPosition} from 'universal/hooks/useCoords'
import lazyPreload from 'universal/utils/lazyPreload'

interface Props {
  defaultTimeLimit: number
  stage: StageTimerControl_stage
}

const StageTimerModal = lazyPreload(async () =>
  import(/* webpackChunkName: 'StageTimerModal' */ 'universal/components/StageTimerModal')
)

const StageTimerControl = (props: Props) => {
  const {defaultTimeLimit, stage} = props
  const {scheduledEndTime} = stage
  const color = scheduledEndTime ? 'green' : 'midGray'
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu(MenuPosition.LOWER_LEFT, {
    isDropdown: true,
    id: 'StageTimerModal'
  })
  return (
    <>
      <BottomNavControl
        innerRef={originRef}
        onMouseEnter={StageTimerModal.preload}
        onClick={togglePortal}
      >
        <BottomNavIconLabel icon='timer' iconColor={color} label={'Timer'} />
      </BottomNavControl>
      {menuPortal(
        <StageTimerModal defaultTimeLimit={defaultTimeLimit} menuProps={menuProps} stage={stage} />
      )}
    </>
  )
}

export default createFragmentContainer(
  StageTimerControl,
  graphql`
    fragment StageTimerControl_stage on NewMeetingStage {
      ...StageTimerModal_stage
      scheduledEndTime
    }
  `
)
