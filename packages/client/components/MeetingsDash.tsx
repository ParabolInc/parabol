import graphql from 'babel-plugin-relay/macro'
import {AnimatePresence} from 'motion/react'
import {type RefObject, useMemo} from 'react'
import {useFragment} from 'react-relay'
import {RRule} from 'rrule'
import type {
  MeetingsDash_viewer$data,
  MeetingsDash_viewer$key
} from '~/__generated__/MeetingsDash_viewer.graphql'
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

type OwnSeries = MeetingsDash_viewer$data['teams'][number]['activeMeetingSeries'][number]
type DashSeries = Omit<OwnSeries, 'groupSeries'>

interface Props {
  meetingsDashRef: RefObject<HTMLDivElement>
  viewer: MeetingsDash_viewer$key | null
}

const MeetingsDash = (props: Props) => {
  const {meetingsDashRef, viewer: viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment MeetingsDash_viewer on User {
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
  const allSeries = useMemo(() => {
    const seriesById = new Map<string, DashSeries>()
    const ownSeries = teams.flatMap((team) => team.activeMeetingSeries)
    ownSeries.forEach((series) => {
      if (!series.cancelledAt) seriesById.set(series.id, series)
    })
    // a sibling is only fetched lightly: when the viewer is on its team it is already here
    // first-hand, & when they are not the server has no meeting to give them anyway
    ownSeries.forEach((series) => {
      series.groupSeries.forEach((sibling) => {
        if (sibling.cancelledAt || seriesById.has(sibling.id)) return
        seriesById.set(sibling.id, {...sibling, mostRecentMeeting: null})
      })
    })
    return [...seriesById.values()]
  }, [teams])
  // Only the owner administers a group, so only they get the one card that stands in for all of
  // it. Everyone else works from their own team's card, which is the only meeting they can join.
  // A group of one is a series the viewer can only partly see, so it stays a normal card too.
  const seriesGroups = useMemo(
    () =>
      getMeetingSeriesGroups(
        allSeries.filter((series) => series.ownerUserId === atmosphere.viewerId)
      ).filter((group) => group.series.length > 1),
    [allSeries, atmosphere.viewerId]
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
    id
    teamId
    name
    createdAt
  }
`

graphql`
  fragment MeetingsDash_series on MeetingSeries {
    id
    title
    teamId
    createdAt
    cancelledAt
    groupId
    ownerUserId
    recurrenceRule
    ...ScheduledSeriesCard_series
    ...MeetingSeriesGroupCard_series
  }
`

graphql`
  fragment MeetingsDashActiveMeetings on Team {
    activeMeetings {
      ...MeetingsDash_meeting @relay(mask: false)
      # Start* mutation payloads reuse this fragment, which is how a teammate's new meeting reaches
      # the store with the fields Dashboard's snackbar reads
      ...useSnacksForNewMeetings_meetings
      meetingSeries {
        cancelledAt
      }
    }
    activeMeetingSeries {
      ...MeetingsDash_series @relay(mask: false)
      mostRecentMeeting {
        ...MeetingsDash_meeting @relay(mask: false)
      }
      # the siblings a group covers on teams the viewer is not on, so the owner of a
      # multi-team series sees the whole group rather than the one slice they belong to
      groupSeries {
        ...MeetingsDash_series @relay(mask: false)
      }
    }
  }
`

export default MeetingsDash
