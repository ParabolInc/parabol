import React, {useState} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {StageTimerModal_stage} from '__generated__/StageTimerModal_stage.graphql'
import {MenuProps} from 'universal/hooks/useMenu'
import Tab from 'universal/components/Tab/Tab'
import Tabs from './Tabs/Tabs'
import Icon from 'universal/components/Icon'
import styled from 'react-emotion'
import SwipeableViews from 'react-swipeable-views'
import StageTimerModalTimeLimit from 'universal/components/StageTimerModalTimeLimit'

interface Props {
  defaultTimeLimit: number
  stage: StageTimerModal_stage
  menuProps: MenuProps
}

const FullTabs = styled(Tabs)({
  width: 240
})

const FullTab = styled(Tab)({
  justifyContent: 'center',
  paddingTop: 4,
  width: 120
})

const Modal = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
})

const TabContents = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
})

const StageTimerModal = (props: Props) => {
  const {defaultTimeLimit, stage} = props
  const [activeIdx, setActiveIdx] = useState(0)
  return (
    <Modal>
      <FullTabs activeIdx={activeIdx}>
        <FullTab label={<Icon>{'timer'}</Icon>} onClick={() => setActiveIdx(0)} />
        <FullTab label={<Icon>{'event'}</Icon>} onClick={() => setActiveIdx(1)} />
      </FullTabs>
      <SwipeableViews enableMouseEvents index={activeIdx} onChangeIndex={setActiveIdx}>
        <TabContents>
          <StageTimerModalTimeLimit defaultTimeLimit={defaultTimeLimit} stage={stage} />
        </TabContents>
        <TabContents />
      </SwipeableViews>
    </Modal>
  )
}

export default createFragmentContainer(
  StageTimerModal,
  graphql`
    fragment StageTimerModal_stage on NewMeetingStage {
      ...StageTimerModalTimeLimit_stage
    }
  `
)
