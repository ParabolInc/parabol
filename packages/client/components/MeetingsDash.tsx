import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import {MeetingsDash_viewer} from '~/__generated__/MeetingsDash_viewer.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useBreakpoint from '../hooks/useBreakpoint'
import useCardsPerRow from '../hooks/useCardsPerRow'
import {MenuPosition} from '../hooks/useCoords'
import useDocumentTitle from '../hooks/useDocumentTitle'
import useMenu from '../hooks/useMenu'
import useTransition from '../hooks/useTransition'
import {
  Breakpoint,
  EmptyMeetingViewMessage,
  Layout,
  UserTaskViewFilterLabels
} from '../types/constEnums'
import getSafeRegex from '../utils/getSafeRegex'
import lazyPreload from '../utils/lazyPreload'
import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'
import {useUserTaskFilters} from '../utils/useUserTaskFilters'
import DashSectionControls from './Dashboard/DashSectionControls'
import DashSectionHeader from './Dashboard/DashSectionHeader'
import DashFilterToggle from './DashFilterToggle/DashFilterToggle'
import DemoMeetingCard from './DemoMeetingCard'
import MeetingCard from './MeetingCard'
import MeetingsDashEmpty from './MeetingsDashEmpty'
import StartMeetingFAB from './StartMeetingFAB'
import TutorialMeetingCard from './TutorialMeetingCard'

interface Props {
  meetingsDashRef: RefObject<HTMLDivElement>
  viewer: MeetingsDash_viewer | null
}

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)

const UserDashTeamMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'UserDashTeamMenu' */
      './UserDashTeamMenu'
    )
)

const StyledDashFilterToggle = styled(DashFilterToggle)({
  margin: '4px 16px 4px 0',
  [desktopBreakpoint]: {
    margin: '0 24px 0 0'
  }
})

const UserTasksHeaderDashSectionControls = styled(DashSectionControls)({
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
  width: '100%',
  overflow: 'initial'
})

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
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {meetingsDashRef, viewer} = props
  const {teams = [], preferredName = '', dashSearch, activeMeetings: meetings} = viewer ?? {}
  const activeMeetings = useMemo(() => {
    const sortedMeetings = meetings
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
      ? sortedMeetings.filter(({name}) => name && name.match(getSafeRegex(dashSearch, 'i')))
      : sortedMeetings
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

  const {
    menuPortal: teamFilterMenuPortal,
    togglePortal: teamFilterTogglePortal,
    originRef: teamFilterOriginRef,
    menuProps: teamFilterMenuProps
  } = useMenu(MenuPosition.UPPER_RIGHT, {
    isDropdown: true
  })

  const {teamIds} = useUserTaskFilters(viewerId)

  const teamFilter = useMemo(
    () => (teamIds ? teams.find(({id: teamId}) => teamIds.includes(teamId)) : undefined),
    [teamIds, teams]
  )

  const teamFilterName = (teamFilter && teamFilter.name) || UserTaskViewFilterLabels.ALL_TEAMS

  if (!viewer || !cardsPerRow) return null
  return (
    <>
      {hasMeetings ? (
        <Wrapper maybeTabletPlus={maybeTabletPlus}>
          <DashSectionHeader>
            <UserTasksHeaderDashSectionControls>
              <StyledDashFilterToggle
                label='Team'
                onClick={teamFilterTogglePortal}
                onMouseEnter={UserDashTeamMenu.preload}
                ref={teamFilterOriginRef}
                value={teamFilterName}
                iconText='group'
                dataCy='team-filter'
              />
              {teamFilterMenuPortal(
                <UserDashTeamMenu menuProps={teamFilterMenuProps} viewer={viewer} />
              )}
            </UserTasksHeaderDashSectionControls>
          </DashSectionHeader>

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

export default createFragmentContainer(MeetingsDash, {
  viewer: graphql`
    fragment MeetingsDash_viewer on User {
      id
      dashSearch
      preferredName
      teams {
        id
        name
        ...MeetingsDashActiveMeetings @relay(mask: false)
      }
      activeMeetings(teamIds: $teamIds) {
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
      }
      ...UserDashTeamMenu_viewer
    }
  `
})
