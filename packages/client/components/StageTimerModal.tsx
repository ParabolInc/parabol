import styled from '@emotion/styled'
import {Event as EventIcon, Timer as TimerIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import SwipeableViews from 'react-swipeable-views'
import {MenuProps} from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV3'
import {StageTimerModal_facilitator} from '../__generated__/StageTimerModal_facilitator.graphql'
import {StageTimerModal_stage} from '../__generated__/StageTimerModal_stage.graphql'
import StageTimerModalEditTimeEnd from './StageTimerModalEditTimeEnd'
import StageTimerModalEditTimeLimit from './StageTimerModalEditTimeLimit'
import StageTimerModalEndTime from './StageTimerModalEndTime'
import StageTimerModalTimeLimit from './StageTimerModalTimeLimit'
import Tab from './Tab/Tab'
import Tabs from './Tabs/Tabs'

const WIDTH = 224

interface Props {
  defaultTimeLimit: number
  defaultToAsync: boolean
  meetingId: string
  stage: StageTimerModal_stage
  menuProps: MenuProps
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
  boxShadow: `inset 0 -1px 0 ${PALETTE.SLATE_300}`
})

const StageTimerModal = (props: Props) => {
  const {defaultTimeLimit, defaultToAsync, meetingId, menuProps, stage, facilitator} = props
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
      />
    )
  }
  return (
    <Modal>
      <StyledTabsBar activeIdx={activeIdx}>
        <FullTab label={<TimerIcon />} onClick={() => setActiveIdx(0)} />
        <FullTab label={<EventIcon />} onClick={() => setActiveIdx(1)} />
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
