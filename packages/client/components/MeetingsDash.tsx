import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject} from 'react'
import {createFragmentContainer} from 'react-relay'
import {MeetingsDash_viewer} from '~/__generated__/MeetingsDash_viewer.graphql'
import blueSquiggle from '../../../static/images/illustrations/blue-squiggle.svg'
import yellowFlashLine from '../../../static/images/illustrations/yellow-flash-line.svg'
import useBreakpoint from '../hooks/useBreakpoint'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useInitialRender from '../hooks/useInitialRender'
import useTransition, {TransitionStatus} from '../hooks/useTransition'
import {Breakpoint, Layout, NavSidebar, RightSidebar} from '../types/constEnums'
import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'
import MeetingCard from './MeetingCard'
import MeetingsDashEmpty from './MeetingsDashEmpty'
import useCardsPerRow from '../hooks/useCardsPerRow'

interface Props {
  meetingsDashRef: RefObject<HTMLDivElement>
  viewer: MeetingsDash_viewer | null
}

const desktopDashWidestMediaQuery = makeMinWidthMediaQuery(Breakpoint.DASH_BREAKPOINT_WIDEST)

const Wrapper = styled('div')({
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
  const {meetingsDashRef, viewer} = props
  const teams = viewer?.teams ?? []
  const activeMeetings = teams
    .flatMap((team) => team.activeMeetings)
    .filter(Boolean)
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
  const hasMeetings = activeMeetings.length > 0
  const meetingsWithKey = activeMeetings.map((meeting, displayIdx) => ({
    ...meeting,
    key: meeting.createdAt,
    displayIdx
  }))
  const transitioningMeetings = useTransition(meetingsWithKey)
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const maybeBigDisplay = useBreakpoint(1900)
  const isInit = useInitialRender()
  const cardsPerRow = useCardsPerRow(meetingsDashRef)

  useDocumentTitle('Meetings | Parabol', 'Meetings')
  if (!viewer) return null
  return (
    <Wrapper ref={meetingsDashRef}>
      {hasMeetings ? (
        <InnerContainer maybeTabletPlus={maybeTabletPlus}>
          {transitioningMeetings.map((meeting, idx) => (
            <MeetingCard
              key={meeting.child.createdAt}
              left={336 * (idx % cardsPerRow)}
              top={300 * Math.floor(idx / cardsPerRow)}
              meeting={meeting.child}
              onTransitionEnd={meeting.onTransitionEnd}
              status={isInit ? TransitionStatus.ENTERED : meeting.status}
            />
          ))}
        </InnerContainer>
      ) : (
        <EmptyContainer>
          <MeetingsDashEmpty />
          {maybeBigDisplay ? (
            <>
              <Squiggle src={blueSquiggle} />
              <Flash src={yellowFlashLine} />
            </>
          ) : null}
        </EmptyContainer>
      )}
    </Wrapper>
  )
}

graphql`
  fragment MeetingsDashActiveMeetings on Team {
    activeMeetings {
      ...MeetingCard_meeting
      ...useSnacksForNewMeetings_meetings
      createdAt
    }
  }
`

export default createFragmentContainer(MeetingsDash, {
  viewer: graphql`
    fragment MeetingsDash_viewer on User {
      teams {
        ...MeetingsDashActiveMeetings @relay(mask: false)
      }
    }
  `
})
