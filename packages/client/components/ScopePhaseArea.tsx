import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {createFragmentContainer} from 'react-relay'
import SwipeableViews from 'react-swipeable-views'
import {ScopePhaseArea_meeting} from '~/__generated__/ScopePhaseArea_meeting.graphql'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV2'
import Icon from './Icon'
import ScopePhaseAreaAddJira from './ScopePhaseAreaAddJira'
import Tab from './Tab/Tab'
import Tabs from './Tabs/Tabs'

interface Props {
  meeting: ScopePhaseArea_meeting
}

const ScopingArea = styled('div')({
  background: '#fff',
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  width: 640,
  height: 476,
  boxShadow: Elevation.Z3
})

const StyledTabsBar = styled(Tabs)({
  boxShadow: `inset 0 -1px 0 ${PALETTE.BORDER_LIGHTER}`,
  maxWidth: '100%'
})

const FullTab = styled(Tab)({
  // padding: '4px 0 8px',
  // width: '30%'
})

const TabIcon = styled(Icon)({
  marginRight: 4
})

const TabLabel = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

const TabContents = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
})

const containerStyle = {height: '100%'}
const innerStyle = {width: '100%', height: '100%'}

const ScopePhaseArea = (props: Props) => {
  const {meeting} = props
  const [activeIdx, setActiveIdx] = useState(0)
  const gotoAddJira = () => {
    setActiveIdx(0)
  }
  const gotoParabol = () => {
    setActiveIdx(1)
  }
  const onChangeIdx = (idx, _fromIdx, props: {reason: string}) => {
    //very buggy behavior, probably linked to the vertical scrolling.
    // to repro, go from team > org > team > org by clicking tabs & see this this get called for who knows why
    if (props.reason === 'focus') return
    setActiveIdx(idx)
  }
  return (
    <ScopingArea>
      <StyledTabsBar activeIdx={activeIdx}>
        <FullTab
          label={
            <TabLabel>
              <TabIcon>{'add'}</TabIcon> Jira Project
            </TabLabel>
          }
          onClick={gotoAddJira}
        />
        <FullTab
          label={
            <TabLabel>
              <TabIcon>{'public'}</TabIcon> Parabol
            </TabLabel>
          }
          onClick={gotoParabol}
        />
      </StyledTabsBar>
      <SwipeableViews
        enableMouseEvents
        index={activeIdx}
        onChangeIndex={onChangeIdx}
        containerStyle={containerStyle}
        style={innerStyle}
      >
        <TabContents>
          <ScopePhaseAreaAddJira gotoParabol={gotoParabol} meeting={meeting} />
        </TabContents>
        <TabContents>
        </TabContents>
      </SwipeableViews>
    </ScopingArea>
  )
}

graphql`
  fragment ScopePhaseArea_phase on GenericMeetingPhase {
    id
  }
`

export default createFragmentContainer(ScopePhaseArea, {
  meeting: graphql`
    fragment ScopePhaseArea_meeting on PokerMeeting {
      ...StageTimerDisplay_meeting
      ...StageTimerControl_meeting
      ...ScopePhaseAreaAddJira_meeting
      endedAt
      localPhase {
        ...ScopePhaseArea_phase @relay(mask: false)
      }
      localStage {
        isComplete
      }
      phases {
        ...ScopePhaseArea_phase @relay(mask: false)
      }
      showSidebar
    }
  `
})
