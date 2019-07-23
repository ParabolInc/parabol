import React, {useState} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {StageTimerModal_stage} from '__generated__/StageTimerModal_stage.graphql'
import {MenuProps} from 'universal/hooks/useMenu'
import Tab from 'universal/components/Tab/Tab'
import Tabs from './Tabs/Tabs'
import Icon from 'universal/components/Icon'
import styled from '@emotion/styled'
import SwipeableViews from 'react-swipeable-views'
import StageTimerModalTimeLimit from 'universal/components/StageTimerModalTimeLimit'
import StageTimerModalEditTimeLimit from 'universal/components/StageTimerModalEditTimeLimit'
import StageTimerModalEndTime from 'universal/components/StageTimerModalEndTime'
import StageTimerModalEditTimeEnd from 'universal/components/StageTimerModalEditTimeEnd'
import {StageTimerModal_facilitator} from '__generated__/StageTimerModal_facilitator.graphql'
import {PALETTE} from 'universal/styles/paletteV2'

const WIDTH = 224

interface Props {
  defaultTimeLimit: number
  defaultToAsync: boolean
  meetingId: string
  stage: StageTimerModal_stage
  menuProps: MenuProps
  teamId: string
  facilitator: StageTimerModal_facilitator
}

const FullTab = styled(Tab)({
  justifyContent: 'center',
  padding: '4px 0 8px',
  width: WIDTH / 2
})

const Modal = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  width: WIDTH
})

const TabContents = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flexDirection: 'column'
})

const StyledTabsBar = styled(Tabs)({
  boxShadow: `inset 0 -1px 0 ${PALETTE.BORDER_LIGHTER}`
})

const StageTimerModal = (props: Props) => {
  const {defaultTimeLimit, defaultToAsync, meetingId, menuProps, stage, facilitator, teamId} = props
  const {isAsync} = stage
  const [activeIdx, setActiveIdx] = useState(defaultToAsync ? 1 : 0)
  const {closePortal} = menuProps
  if (isAsync === false) {
    return (
      <StageTimerModalEditTimeLimit meetingId={meetingId} closePortal={closePortal} stage={stage} />
    )
  } else if (isAsync) {
    return (
      <StageTimerModalEditTimeEnd
        meetingId={meetingId}
        closePortal={closePortal}
        stage={stage}
        facilitator={facilitator}
        teamId={teamId}
      />
    )
  }
  return (
    <Modal>
      <StyledTabsBar activeIdx={activeIdx}>
        <FullTab label={<Icon>{'timer'}</Icon>} onClick={() => setActiveIdx(0)} />
        <FullTab label={<Icon>{'event'}</Icon>} onClick={() => setActiveIdx(1)} />
      </StyledTabsBar>
      <SwipeableViews
        enableMouseEvents
        index={activeIdx}
        onChangeIndex={(idx) => setActiveIdx(idx)}
        animateHeight
      >
        <TabContents>
          <StageTimerModalTimeLimit
            defaultTimeLimit={defaultTimeLimit}
            meetingId={meetingId}
            closePortal={closePortal}
            stage={stage}
          />
        </TabContents>
        <TabContents>
          <StageTimerModalEndTime
            facilitator={facilitator}
            meetingId={meetingId}
            closePortal={closePortal}
            stage={stage}
            teamId={teamId}
          />
        </TabContents>
      </SwipeableViews>
    </Modal>
  )
}

export default createFragmentContainer(StageTimerModal, {
  facilitator: graphql`
    fragment StageTimerModal_facilitator on TeamMember {
      ...StageTimerModalEndTime_facilitator
      ...StageTimerModalEditTimeEnd_facilitator
    }
  `,
  stage: graphql`
    fragment StageTimerModal_stage on NewMeetingStage {
      ...StageTimerModalTimeLimit_stage
      ...StageTimerModalEditTimeLimit_stage
      ...StageTimerModalEndTime_stage
      ...StageTimerModalEditTimeEnd_stage
      isAsync
      suggestedTimeLimit
    }
  `
})
