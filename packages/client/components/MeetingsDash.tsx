import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useMemo} from 'react'
import {useFragment} from 'react-relay'
import {MeetingsDash_viewer$key} from '~/__generated__/MeetingsDash_viewer.graphql'
import useBreakpoint from '../hooks/useBreakpoint'
import useCardsPerRow from '../hooks/useCardsPerRow'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useTransition from '../hooks/useTransition'
import {Breakpoint, EmptyMeetingViewMessage, Layout} from '../types/constEnums'
import getSafeRegex from '../utils/getSafeRegex'
import DemoMeetingCard from './DemoMeetingCard'
import MeetingCard from './MeetingCard'
import MeetingsDashEmpty from './MeetingsDashEmpty'
import StartMeetingFAB from './StartMeetingFAB'
import TutorialMeetingCard from './TutorialMeetingCard'

interface Props {
  meetingsDashRef: RefObject<HTMLDivElement>
  viewer: MeetingsDash_viewer$key | null
}

const Wrapper = styled('div')<{maybeTabletPlus: boolean}>(({maybeTabletPlus}) => ({
  padding: maybeTabletPlus ? 0 : 16,
  display: 'flex',
  flexWrap: 'wrap',
  position: 'relative'
}))

const EmptyContainer = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  maxWidth: Layout.TASK_COLUMNS_MAX_WIDTH,
  padding: '16px 8px',
  position: 'relative'
})

const MeetingsDash = (props: Props) => {
  const {meetingsDashRef, viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment MeetingsDash_viewer on User {
        id
        dashSearch
        preferredName
        teams {
          ...MeetingsDashActiveMeetings @relay(mask: false)
        }
      }
    `,
    viewerRef
  )
  const {teams = [], preferredName = '', dashSearch} = viewer ?? {}
  const activeMeetings = useMemo(() => {
    const meetings = teams
      .flatMap((team) => team.activeMeetings)
      .filter(Boolean)
      .sort((a, b) => {
        const aRecurring = !!(a.meetingSeries && !a.meetingSeries.cancelledAt)
        const bRecurring = !!(b.meetingSeries && !b.meetingSeries.cancelledAt)
        if (aRecurring && !bRecurring) {
          return -1
        }
        if (bRecurring && !aRecurring) {
          return 1
        }

        if (aRecurring && bRecurring) {
          // When ordering recurring meetings, sort based on when the series was created to maintain
          // consistency when meetings are restarted.
          return a.meetingSeries.createdAt > b.meetingSeries.createdAt ? -1 : 1
        }

        return a.createdAt > b.createdAt ? -1 : 1
      })
    const filteredMeetings = dashSearch
      ? meetings.filter(({name}) => name && name.match(getSafeRegex(dashSearch, 'i')))
      : meetings
    return filteredMeetings.map((meeting, displayIdx) => ({
      ...meeting,
      key: meeting.id,
      displayIdx
    }))
  }, [teams, dashSearch])
  const transitioningMeetings = useTransition(activeMeetings)
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const cardsPerRow = useCardsPerRow(meetingsDashRef)
  const hasMeetings = activeMeetings.length > 0
  useDocumentTitle('Meetings | Parabol', 'Meetings')
  if (!viewer || !cardsPerRow) return null
  return (
    <>
      {hasMeetings ? (
        <Wrapper maybeTabletPlus={maybeTabletPlus}>
          {transitioningMeetings.map((meeting) => {
            const {child} = meeting
            const {id, displayIdx} = child
            return (
              <MeetingCard
                key={id}
                displayIdx={displayIdx}
                meeting={meeting.child}
                onTransitionEnd={meeting.onTransitionEnd}
                status={meeting.status}
              />
            )
          })}
        </Wrapper>
      ) : (
        <EmptyContainer>
          <MeetingsDashEmpty
            name={preferredName}
            message={
              dashSearch
                ? EmptyMeetingViewMessage.NO_SEARCH_RESULTS
                : EmptyMeetingViewMessage.NO_ACTIVE_MEETINGS
            }
          />
          <Wrapper maybeTabletPlus={maybeTabletPlus}>
            <DemoMeetingCard />
            <TutorialMeetingCard />
          </Wrapper>
        </EmptyContainer>
      )}
      <StartMeetingFAB />
    </>
  )
}

graphql`
  fragment MeetingsDashActiveMeetings on Team {
    activeMeetings {
      ...MeetingCard_meeting
      ...useSnacksForNewMeetings_meetings
      id
      name
      createdAt
      meetingMembers {
        user {
          isConnected
          lastSeenAtURLs
        }
      }
      ... on TeamPromptMeeting {
        meetingSeries {
          createdAt
          cancelledAt
        }
      }
    }
  }
`

export default MeetingsDash
