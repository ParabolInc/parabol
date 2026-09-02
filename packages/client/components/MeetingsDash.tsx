import graphql from 'babel-plugin-relay/macro'
import {AnimatePresence} from 'motion/react'
import {type RefObject, useMemo} from 'react'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
import type {MeetingsDash_viewer$key} from '~/__generated__/MeetingsDash_viewer.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useBreakpoint from '../hooks/useBreakpoint'
import useCardsPerRow from '../hooks/useCardsPerRow'
import useDocumentTitle from '../hooks/useDocumentTitle'
import {Breakpoint, EmptyMeetingViewMessage} from '../types/constEnums'
import {cn} from '../ui/cn'
import getMeetingSeriesGroups from '../utils/getMeetingSeriesGroups'
import getSafeRegex from '../utils/getSafeRegex'
import {toHumanReadable} from '../utils/humanReadableRecurrenceRule'
import {useQueryParameterParser} from '../utils/useQueryParameterParser'
import DemoMeetingCard from './DemoMeetingCard'
import MeetingCard from './MeetingCard'
import MeetingSeriesGroupCard from './MeetingSeriesGroupCard'
import MeetingsDashEmpty from './MeetingsDashEmpty'
import MeetingsDashHeader from './MeetingsDashHeader'
import ScheduledSeriesCard from './ScheduledSeriesCard'
import StartMeetingFAB from './StartMeetingFAB'
import TutorialMeetingCard from './TutorialMeetingCard'

interface Props {
  meetingsDashRef: RefObject<HTMLDivElement>
  viewer: MeetingsDash_viewer$key | null
}

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
  const {teamIds: teamFilterIds} = useQueryParameterParser(atmosphere.viewerId)
  const {teams = [], preferredName = '', dashSearch} = viewer ?? {}
  const allSeries = useMemo(
    () => teams.flatMap((team) => team.activeMeetingSeries).filter((s) => !s.cancelledAt),
    [teams]
  )
  // a group of one is a series the viewer can only partly see, so it stays a normal card
  const seriesGroups = useMemo(
    () => getMeetingSeriesGroups(allSeries).filter((group) => group.series.length > 1),
    [allSeries]
  )
  const groupedSeriesIds = useMemo(
    () => new Set(seriesGroups.flatMap((group) => group.series.map((series) => series.id))),
    [seriesGroups]
  )
  const activeMeetings = useMemo(() => {
    const meetingSeriesMeetings = allSeries
      .filter((meetingSeries) => !!meetingSeries.mostRecentMeeting)
      .filter((meetingSeries) => !groupedSeriesIds.has(meetingSeries.id))
      .sort((a, b) => {
        return a.createdAt > b.createdAt ? -1 : 1
      })
      .map((meetingSeries) => meetingSeries.mostRecentMeeting!)
    const otherActiveMeetings = teams
      .flatMap((team) => team.activeMeetings)
      .filter(Boolean)
      .filter((meeting) => !meeting.meetingSeries || meeting.meetingSeries.cancelledAt)
      .sort((a, b) => {
        return a.createdAt > b.createdAt ? -1 : 1
      })
    return [...meetingSeriesMeetings, ...otherActiveMeetings]
  }, [teams, allSeries, groupedSeriesIds])
  const scheduledSeries = useMemo(
    () =>
      allSeries
        .filter((s) => !s.mostRecentMeeting)
        .filter((s) => !groupedSeriesIds.has(s.id))
        .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)),
    [allSeries, groupedSeriesIds]
  )
  const filteredMeetings = useMemo(() => {
    const searchedMeetings = dashSearch
      ? activeMeetings.filter(({name}) => name && name.match(getSafeRegex(dashSearch, 'i')))
      : activeMeetings
    const filteredMeetings = teamFilterIds
      ? searchedMeetings.filter((node) => teamFilterIds.includes(node.teamId))
      : searchedMeetings
    return filteredMeetings
  }, [activeMeetings, dashSearch, teamFilterIds])
  const filteredScheduledSeries = useMemo(() => {
    const searched = dashSearch
      ? scheduledSeries.filter(({title}) => title && title.match(getSafeRegex(dashSearch, 'i')))
      : scheduledSeries
    const teamFiltered = teamFilterIds
      ? searched.filter((s) => teamFilterIds.includes(s.teamId))
      : searched
    return teamFiltered
  }, [scheduledSeries, dashSearch, teamFilterIds])
  const filteredSeriesGroups = useMemo(() => {
    const searched = dashSearch
      ? seriesGroups.filter(({title}) => title && title.match(getSafeRegex(dashSearch, 'i')))
      : seriesGroups
    // a team filter keeps the group, narrowed to that team's series
    if (!teamFilterIds) return searched
    return searched
      .map((group) => ({
        ...group,
        series: group.series.filter((series) => teamFilterIds.includes(series.teamId))
      }))
      .filter((group) => group.series.length > 0)
  }, [seriesGroups, dashSearch, teamFilterIds])
  const maybeTabletPlus = useBreakpoint(Breakpoint.FUZZY_TABLET)
  const cardsPerRow = useCardsPerRow(meetingsDashRef)
  const hasFilteredMeetings =
    filteredMeetings.length > 0 ||
    filteredScheduledSeries.length > 0 ||
    filteredSeriesGroups.length > 0
  useDocumentTitle('Meetings | Parabol', 'Meetings')
  if (!viewer || !cardsPerRow) return null

  return (
    <>
      <MeetingsDashHeader viewerRef={viewer} />
      {hasFilteredMeetings ? (
        <div className={cn('relative flex flex-wrap', maybeTabletPlus ? 'px-5' : 'p-4')}>
          <AnimatePresence initial={false}>
            {filteredSeriesGroups.map((group) => {
              // a single series narrowed by the team filter is just a normal card
              if (group.series.length === 1) {
                const series = group.series[0]!
                return series.mostRecentMeeting ? (
                  <MeetingCard
                    key={series.mostRecentMeeting.id}
                    meeting={series.mostRecentMeeting}
                  />
                ) : (
                  <ScheduledSeriesCard key={`series-${series.id}`} series={series} />
                )
              }
              return (
                <MeetingSeriesGroupCard
                  key={`group-${group.groupId}`}
                  seriesRefs={group.series}
                  recurrenceLabel={toHumanReadable(RRule.fromString(group.recurrenceRule), {
                    isPartOfSentence: true
                  })}
                />
              )
            })}
            {filteredScheduledSeries.map((series) => (
              <ScheduledSeriesCard key={`series-${series.id}`} series={series} />
            ))}
            {filteredMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className='relative flex h-full max-w-340 flex-1 flex-col px-2 py-4'>
          <MeetingsDashEmpty
            name={preferredName}
            message={
              dashSearch
                ? EmptyMeetingViewMessage.NO_SEARCH_RESULTS_ON_THE_TEAM
                : EmptyMeetingViewMessage.NO_ACTIVE_MEETINGS_ON_THE_TEAM
            }
            isTeamFilterSelected={!!teamFilterIds}
          />
          {!teamFilterIds ? (
            <div className={cn('relative flex flex-wrap', maybeTabletPlus ? 'p-0' : 'p-4')}>
              <DemoMeetingCard />
              <TutorialMeetingCard type='retro' />
              <TutorialMeetingCard type='standup' />
              <TutorialMeetingCard type='poker' />
            </div>
          ) : null}
        </div>
      )}
      <StartMeetingFAB />
    </>
  )
}

graphql`
  fragment MeetingsDash_meeting on NewMeeting {
    ...MeetingCard_meeting
    ...useSnacksForNewMeetings_meetings
    id
    teamId
    name
    createdAt
  }
`

graphql`
  fragment MeetingsDashActiveMeetings on Team {
    activeMeetings {
      ...MeetingsDash_meeting @relay(mask: false)
      meetingSeries {
        createdAt
        cancelledAt
      }
    }
    activeMeetingSeries {
      id
      title
      teamId
      createdAt
      cancelledAt
      groupId
      recurrenceRule
      mostRecentMeeting {
        ...MeetingsDash_meeting @relay(mask: false)
      }
      ...ScheduledSeriesCard_series
      ...MeetingSeriesGroupCard_series
    }
  }
`

export default MeetingsDash
