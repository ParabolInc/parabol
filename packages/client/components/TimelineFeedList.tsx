import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {usePaginationFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import useLoadNextOnScrollBottom from '~/hooks/useLoadNextOnScrollBottom'
import {TimelineFeedListPaginationQuery} from '../__generated__/TimelineFeedListPaginationQuery.graphql'
import {TimelineFeedList_query$key} from '../__generated__/TimelineFeedList_query.graphql'
import TimelineEvent from './TimelineEvent'
import TimelineHistoryLockedCard from './TimelineHistoryLockedCard'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

const DateHeader = styled('div')({
  padding: '16px 0 8px',
  fontSize: '1rem',
  fontWeight: 600,
  color: 'rgb(71 85 105)', // slate-600
  position: 'sticky',
  top: 0,
  backgroundColor: 'white',
  zIndex: 1
})

interface TimelineGroup {
  date: Date
  events: any[]
}

interface TimelineEdge {
  node: {
    createdAt: string
    [key: string]: any
  }
}

const getGroupingFrequency = (events: readonly TimelineEdge[]): 'day' | 'week' | 'month' => {
  if (!events.length) return 'day'
  const firstEvent = events[0]
  const lastEvent = events[events.length - 1]
  if (!firstEvent?.node.createdAt || !lastEvent?.node.createdAt) return 'day'

  const firstDate = new Date(firstEvent.node.createdAt)
  const lastDate = new Date(lastEvent.node.createdAt)
  const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)

  if (daysDiff <= 14) return 'day'
  if (daysDiff <= 60) return 'week'
  return 'month'
}

const formatGroupDate = (date: Date, frequency: 'day' | 'week' | 'month'): string => {
  const options: {[key in 'day' | 'week' | 'month']: Intl.DateTimeFormatOptions} = {
    day: {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    },
    week: {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    },
    month: {
      month: 'long',
      year: 'numeric'
    }
  }

  return new Intl.DateTimeFormat('en-US', options[frequency]).format(date)
}

const getGroupDate = (date: Date, frequency: 'day' | 'week' | 'month'): Date => {
  const newDate = new Date(date)
  if (frequency === 'day') {
    newDate.setHours(0, 0, 0, 0)
  } else if (frequency === 'week') {
    newDate.setDate(newDate.getDate() - newDate.getDay()) // Start of week
    newDate.setHours(0, 0, 0, 0)
  } else {
    newDate.setDate(1) // Start of month
    newDate.setHours(0, 0, 0, 0)
  }
  return newDate
}

interface Props {
  queryRef: TimelineFeedList_query$key
}

const TimelineFeedList = (props: Props) => {
  const {queryRef} = props
  const paginationRes = usePaginationFragment<
    TimelineFeedListPaginationQuery,
    TimelineFeedList_query$key
  >(
    // TODO: can't `on User` directly because not implements Node (i.e. a type that has an id).
    // https://relay.dev/docs/api-reference/use-refetchable-fragment/#arguments
    graphql`
      fragment TimelineFeedList_query on Query
      @refetchable(queryName: "TimelineFeedListPaginationQuery") {
        viewer {
          timeline(
            first: $first
            after: $after
            teamIds: $teamIds
            eventTypes: $eventTypes
            archived: $archived
          ) @connection(key: "TimelineFeedList_timeline") {
            edges {
              cursor
              node {
                ...TimelineEvent_timelineEvent
                __typename
                id
                teamId
                createdAt
                organization {
                  id
                  viewerOrganizationUser {
                    id
                  }
                  ...TimelineHistoryLockedCard_organization
                }
                ... on TimelineEventCompletedActionMeeting {
                  meeting {
                    locked
                  }
                }
                ... on TimelineEventPokerComplete {
                  meeting {
                    locked
                  }
                }
                ... on TimelineEventTeamPromptComplete {
                  meeting {
                    locked
                  }
                }
                ... on TimelineEventCompletedRetroMeeting {
                  meeting {
                    locked
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `,
    queryRef
  )

  const {data} = paginationRes
  const {viewer} = data
  const {timeline} = viewer
  const lastItem = useLoadNextOnScrollBottom(paginationRes, {}, 10)

  // freeHistory also contains locked meetings which are not unlockable,
  // i.e. it's not paid but the user is not in the org anymore
  const {freeHistory, lockedHistory} = useMemo(() => {
    const firstLocked = timeline.edges.findIndex(
      ({node: timelineEvent}) =>
        timelineEvent.meeting?.locked && timelineEvent.organization?.viewerOrganizationUser
    )
    if (firstLocked === -1) {
      return {
        freeHistory: timeline.edges
      }
    }
    return {
      freeHistory: timeline.edges.slice(0, firstLocked),
      lockedHistory: timeline.edges.slice(firstLocked)
    }
  }, [timeline.edges])

  const groupedFreeHistory = useMemo(() => {
    const frequency = getGroupingFrequency(freeHistory)
    const groups: TimelineGroup[] = []

    freeHistory.forEach((edge) => {
      const eventDate = new Date(edge.node.createdAt)
      const groupDate = getGroupDate(eventDate, frequency)

      let group = groups.find((g) => g.date.getTime() === groupDate.getTime())
      if (!group) {
        group = {date: groupDate, events: []}
        groups.push(group)
      }
      group.events.push(edge)
    })

    return {groups, frequency}
  }, [freeHistory])

  if (freeHistory.length === 0 && !lockedHistory?.length) {
    return (
      <div className='text-base'>
        Looks like you have no events with these filters.
        <Link to={'/me'} className='font-sans font-semibold text-sky-500 no-underline'>
          {' '}
          Show all events.
        </Link>
      </div>
    )
  }

  return (
    <ResultScroller>
      {groupedFreeHistory.groups.map(({date, events}) => (
        <div key={date.toISOString()}>
          <DateHeader>{formatGroupDate(date, groupedFreeHistory.frequency)}</DateHeader>
          {events.map(({node: timelineEvent}) => (
            <TimelineEvent key={timelineEvent.id} timelineEvent={timelineEvent} />
          ))}
        </div>
      ))}
      {lockedHistory && (
        <>
          <TimelineHistoryLockedCard
            organizationRef={lockedHistory[0]!.node.organization ?? null}
          />
          {lockedHistory.map(({node: timelineEvent}) => (
            <TimelineEvent key={timelineEvent.id} timelineEvent={timelineEvent} />
          ))}
        </>
      )}
      {lastItem}
    </ResultScroller>
  )
}

export default TimelineFeedList
