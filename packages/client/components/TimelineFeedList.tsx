import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {usePaginationFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import useLoadNextOnScrollBottom from '~/hooks/useLoadNextOnScrollBottom'
import {TimelineGroup, compareTimelineLabels, getTimeGroup} from '~/utils/date/timelineGroups'
import {TimelineFeedListPaginationQuery} from '../__generated__/TimelineFeedListPaginationQuery.graphql'
import {TimelineFeedList_query$key} from '../__generated__/TimelineFeedList_query.graphql'
import TimelineEvent from './TimelineEvent'
import TimelineHistoryLockedCard from './TimelineHistoryLockedCard'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

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
      const label = getTimeGroup(eventDate)

      let group = groups.find((g) => g.label === label)
      if (!group) {
        group = {events: [], label}
        groups.push(group)
      }
      group.events.push(edge)
    })

    // Sort groups by label order (newer first)
    groups.sort((a, b) => compareTimelineLabels(a.label, b.label))
    return groups
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
      {groupedFreeHistory.map(({label, events}) => (
        <div key={label}>
          <div className='my-2 flex items-center gap-4 py-4'>
            <div className='h-[1px] flex-1 bg-slate-400' />
            <div className='bg-slate-50 rounded-full border border-slate-200 px-3 py-1 text-sm font-medium text-slate-600'>
              {label}
            </div>
            <div className='h-[1px] flex-1 bg-slate-400' />
          </div>
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
