import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {usePaginationFragment} from 'react-relay'
import useLoadNextOnScrollBottom from '~/hooks/useLoadNextOnScrollBottom'
import {TimelineFeedListPaginationQuery} from '../__generated__/TimelineFeedListPaginationQuery.graphql'
import {TimelineFeedList_query$key} from '../__generated__/TimelineFeedList_query.graphql'
import TimelineEvent from './TimelineEvent'

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
  return (
    <ResultScroller>
      {timeline.edges.map(({node: timelineEvent}) => (
        <TimelineEvent key={timelineEvent.id} timelineEvent={timelineEvent} />
      ))}
      {lastItem}
    </ResultScroller>
  )
}

export default TimelineFeedList
