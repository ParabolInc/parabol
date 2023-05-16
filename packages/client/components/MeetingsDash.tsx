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
import MeetingsDashNoFilteredResults from './MeetingsDashNoFilteredResults'
import MeetingsDashHeader from './MeetingsDashHeader'
import StartMeetingFAB from './StartMeetingFAB'
import TutorialMeetingCard from './TutorialMeetingCard'
import {useUserTaskFilters} from '../utils/useUserTaskFilters'
import useAtmosphere from '../hooks/useAtmosphere'

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
        ...MeetingsDashHeader_viewer
      }
    `,
    viewerRef
  )
  const atmosphere = useAtmosphere()
  const {teamIds} = useUserTaskFilters(atmosphere.viewerId)
  const {teams = [], preferredName = '', dashSearch} = viewer ?? {}
  const activeMeetings = useMemo(
    () =>
      teams
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
        }),
    [teams, dashSearch, teamIds]
  )
  const filteredMeetings = useMemo(() => {
    const searchedMeetings = dashSearch
      ? activeMeetings.filter(({name}) => name && name.match(getSafeRegex(dashSearch, 'i')))
      : activeMeetings
    const filteredMeetings = teamIds
      ? searchedMeetings.filter((node) => teamIds.includes(node.teamId))
      : searchedMeetings
    return filteredMeetings.map((meeting, displayIdx) => ({
      ...meeting,
      key: meeting.id,
      displayIdx
    }))
  }, [teams, dashSearch, teamIds])
  const transitioningMeetings = useTransition(filteredMeetings)
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const cardsPerRow = useCardsPerRow(meetingsDashRef)
  const hasMeetings = activeMeetings.length > 0
  const hasFilteredMeetings = filteredMeetings.length > 0
  useDocumentTitle('Meetings | Parabol', 'Meetings')
  if (!viewer || !cardsPerRow) return null
  return (
    <>
      <MeetingsDashHeader viewerRef={viewer} />
      {hasMeetings ? (
        hasFilteredMeetings ? (
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
            <MeetingsDashNoFilteredResults name={preferredName} />
          </EmptyContainer>
        )
      ) : (
        <EmptyContainer>
          <MeetingsDashEmpty
            name={preferredName}
            message={EmptyMeetingViewMessage.NO_ACTIVE_MEETINGS}
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
      teamId
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
