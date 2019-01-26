import {TimelineFeedList_viewer} from '__generated__/TimelineFeedList_viewer.graphql'
import React from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
import TimelineEvent from './TimelineEvent'

interface Props {
  viewer: TimelineFeedList_viewer
}

const TimelineFeedList = (props: Props) => {
  const {viewer} = props
  const {timeline} = viewer
  return (
    <div>
      {timeline.edges.map(({node: timelineEvent}) => (
        <TimelineEvent key={timelineEvent.id} timelineEvent={timelineEvent} />
      ))}
    </div>
  )
}

export default createPaginationContainer<Props>(
  TimelineFeedList,
  graphql`
    fragment TimelineFeedList_viewer on User {
      timeline(first: $first, after: $after) @connection(key: "TimelineFeedList_timeline") {
        edges {
          cursor
          node {
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
  `,
  {
    direction: 'forward',
    getConnectionFromProps (props) {
      const {viewer} = props
      return viewer && viewer.timeline
    },
    getFragmentVariables (prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      }
    },
    getVariables (_props, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: count,
        after: cursor
      }
    },
    query: graphql`
      query TimelineFeedListPaginationQuery($first: Int!, $after: DateTime) {
        viewer {
          ...TimelineFeedList_viewer
        }
      }
    `
  }
)
