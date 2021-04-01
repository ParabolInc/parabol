import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {MeetingsDash_viewer} from '~/__generated__/MeetingsDash_viewer.graphql'
import useBreakpoint from '../hooks/useBreakpoint'
import {Breakpoint, Layout, NavSidebar, RightSidebar} from '../types/constEnums'
import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'
import MeetingCard from './MeetingCard'
import MeetingsDashEmpty from './MeetingsDashEmpty'

interface Props {
  viewer: MeetingsDash_viewer | null
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

const InnerContainer = styled('div')<{maybeTabletPlus: boolean}>(({maybeTabletPlus}) => ({
  display: 'flex',
  flexWrap: 'wrap',
  margin: '0 auto auto',
  maxWidth: Layout.TASK_COLUMNS_MAX_WIDTH,
  padding: maybeTabletPlus ? '16px 0 0 16px' : '16px 16px 0',
  width: '100%'
}))

const EmptyContainer = styled('div')({
  display: 'flex',
  flex: 1,
  height: '100%',
  margin: '0 auto',
  maxWidth: Layout.TASK_COLUMNS_MAX_WIDTH,
  padding: 16,
  position: 'relative'
})

const Squiggle = styled('img')({
  bottom: 80,
  display: 'block',
  position: 'absolute',
  right: 160
})

const Flash = styled('img')({
  bottom: 56,
  display: 'block',
  position: 'absolute',
  right: -32
})

const MeetingsDash = (props: Props) => {
  const {viewer} = props
  const teams = viewer?.teams ?? []
  const activeMeetings = teams.flatMap((team) => team.activeMeetings)
  const hasMeetings = activeMeetings.length > 0
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const maybeBigDisplay = useBreakpoint(1900)
  if (!viewer) return null
  return (
    <Wrapper>
      {hasMeetings ? (
        <InnerContainer maybeTabletPlus={maybeTabletPlus}>
          {activeMeetings.map((meeting, idx) => (
            <MeetingCard key={idx} meeting={meeting} />
          ))}
        </InnerContainer>
      ) : (
        <EmptyContainer>
          <MeetingsDashEmpty />
          {maybeBigDisplay ? (
            <>
              <Squiggle src={`${__STATIC_IMAGES__}/illustrations/blue-squiggle.svg`} />
              <Flash src={`${__STATIC_IMAGES__}/illustrations/yellow-flash-line.svg`} />
            </>
          ) : null}
        </EmptyContainer>
      )}
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
