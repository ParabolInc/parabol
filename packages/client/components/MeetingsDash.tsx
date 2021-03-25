import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MeetingsDash_viewer} from '~/__generated__/MeetingsDash_viewer.graphql'
import MeetingCard from './MeetingCard'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint, Layout, NavSidebar, RightSidebar} from '../types/constEnums'
import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'
import MeetingsDashEmpty from './MeetingsDashEmpty'

interface Props {
  viewer: MeetingsDash_viewer
}

const desktopDashWidestMediaQuery = makeMinWidthMediaQuery(Breakpoint.DASH_BREAKPOINT_WIDEST)

const Wrapper = styled('div')({
  display: 'flex',
  height: '100%',
  margin: '0 auto',
  width: '100%',
  [desktopDashWidestMediaQuery]: {
    paddingLeft: NavSidebar.WIDTH,
    paddingRight: RightSidebar.WIDTH
  }
})

const InnerContainer = styled('div')<{maybeTabletPlus: boolean, hasMeetings: boolean}>(({maybeTabletPlus, hasMeetings}) => ({
  alignContent: hasMeetings ? 'flex-start' : 'center',
  display: 'flex',
  flex: 1,
  flexWrap: 'wrap',
  height: '100%',
  margin: '0 auto',
  maxWidth: Layout.TASK_COLUMNS_MAX_WIDTH,
  padding: maybeTabletPlus ? '16px 0 0 16px' : '16px 16px 0',
  width: '100%'
}))

const MeetingsDash = (props: Props) => {
  const {viewer} = props
  const {teams} = viewer
  const activeMeetings = teams.flatMap((team) => team.activeMeetings)
  const hasMeetings = activeMeetings.length > 0
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)
  return (
    <Wrapper>
      <InnerContainer hasMeetings={hasMeetings} maybeTabletPlus={maybeTabletPlus}>
        {hasMeetings
          ? <>{activeMeetings.map((meeting, idx) => <MeetingCard key={idx} meeting={meeting} />)}</>
          : <MeetingsDashEmpty />
        }
      </InnerContainer>
    </Wrapper>
  )
}

export default createFragmentContainer(MeetingsDash, {
  viewer: graphql`
    fragment MeetingsDash_viewer on User {
      teams {
        activeMeetings {
          ...MeetingCard_meeting
        }
      }
    }
  `
})
