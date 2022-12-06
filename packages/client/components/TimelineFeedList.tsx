import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useMemo} from 'react'
import {usePaginationFragment} from 'react-relay'
import useLoadNextOnScrollBottom from '~/hooks/useLoadNextOnScrollBottom'
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
          timeline(first: $first, after: $after) @connection(key: "TimelineFeedList_timeline") {
            edges {
              cursor
              node {
                ...TimelineEvent_timelineEvent
                __typename
                id
                teamId
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

  return (
    <ResultScroller>
      {freeHistory.map(({node: timelineEvent}) => (
        <TimelineEvent key={timelineEvent.id} timelineEvent={timelineEvent} />
      ))}
      {lockedHistory && (
        <>
          <TimelineHistoryLockedCard organizationRef={lockedHistory[0]!.node.organization} />
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
