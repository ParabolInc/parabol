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
  label: string
}

const getTimeGroup = (date: Date): {date: Date; label: string} => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)
  const lastMonth = new Date(today)
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  const last3Months = new Date(today)
  last3Months.setMonth(last3Months.getMonth() - 3)
  const last6Months = new Date(today)
  last6Months.setMonth(last6Months.getMonth() - 6)

  if (date >= today) {
    return {date: today, label: '🌅 Today'}
  } else if (date >= yesterday) {
    return {date: yesterday, label: '🌙 Yesterday'}
  } else if (date >= lastWeek) {
    return {date: lastWeek, label: '📅 This week'}
  } else if (date >= lastMonth) {
    return {date: lastMonth, label: '📆 This month'}
  } else if (date >= last3Months) {
    return {date: last3Months, label: '🗓️ Past 3 months'}
  } else if (date >= last6Months) {
    return {date: last6Months, label: '📚 Past 6 months'}
  }
  return {date: last6Months, label: '🏛️ Ancient history'}
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
    const groups: TimelineGroup[] = []

    freeHistory.forEach((edge) => {
      const eventDate = new Date(edge.node.createdAt)
      const {date: groupDate, label} = getTimeGroup(eventDate)

      let group = groups.find((g) => g.date.getTime() === groupDate.getTime())
      if (!group) {
        group = {date: groupDate, events: [], label}
        groups.push(group)
      }
      group.events.push(edge)
    })

    // Sort groups by date (newest first)
    groups.sort((a, b) => b.date.getTime() - a.date.getTime())
    return {groups}
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
      {groupedFreeHistory.groups.map(({date, events, label}) => (
        <div key={date.toISOString()}>
          <DateHeader>{label}</DateHeader>
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
