import {TimelineFeedList_viewer} from '__generated__/TimelineFeedList_viewer.graphql'
import React, {Component} from 'react'
import {createPaginationContainer, graphql, RelayPaginationProp} from 'react-relay'
import TimelineEvent from './TimelineEvent'

interface Props {
  viewer: TimelineFeedList_viewer
  relay: RelayPaginationProp
}

class TimelineFeedList extends Component<Props> {
  componentDidMount () {
    window.addEventListener('scroll', this.onScroll)
  }

  componentWillUnmount (): void {
    window.removeEventListener('scroll', this.onScroll)
  }

  onScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      this.loadMore()
    }
  }

  loadMore = () => {
    const {
      relay: {hasMore, isLoading, loadMore}
    } = this.props
    if (!hasMore() || isLoading()) return
    // can remove pending https://github.com/DefinitelyTyped/DefinitelyTyped/pull/32609
    loadMore(20, undefined as any)
  }

  render () {
    const {viewer} = this.props
    const {timeline} = viewer
    return (
      <div>
        {timeline.edges.map(({node: timelineEvent}) => (
          <TimelineEvent key={timelineEvent.id} timelineEvent={timelineEvent} />
        ))}
      </div>
    )
  }
}

export default createPaginationContainer(
  TimelineFeedList,
  graphql`
    fragment TimelineFeedList_viewer on User {
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
  `,
  {
    direction: 'forward',
    getConnectionFromProps (props: any) {
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
