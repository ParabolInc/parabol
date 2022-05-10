import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {usePaginationFragment} from 'react-relay'
import useLoadNextOnScrollBottom from '~/hooks/useLoadNextOnScrollBottom'
import {TimelineFeedListPaginationQuery} from '../__generated__/TimelineFeedListPaginationQuery.graphql'
import {TimelineFeedList_viewer$key} from '../__generated__/TimelineFeedList_viewer.graphql'
import TimelineEvent from './TimelineEvent'

const ResultScroller = styled('div')({
  overflow: 'auto'
})

interface Props {
  viewerRef: TimelineFeedList_viewer$key
}

const TimelineFeedList = (props: Props) => {
  const {viewerRef} = props
  const paginationRes = usePaginationFragment<
    TimelineFeedListPaginationQuery,
    TimelineFeedList_viewer$key
  >(
    // TODO: can't `on User` directly because not implements Node (i.e. a type that has an id).
    // https://relay.dev/docs/api-reference/use-refetchable-fragment/#arguments
    graphql`
      fragment TimelineFeedList_viewer on Query
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
    viewerRef
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
