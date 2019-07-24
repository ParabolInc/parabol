import {TimelineFeedList_viewer} from '../../__generated__/TimelineFeedList_viewer.graphql'
import React, {Component} from 'react'
import {createPaginationContainer, graphql, RelayPaginationProp} from 'react-relay'
import TimelineEvent from './TimelineEvent'
import 'intersection-observer'

interface Props {
  viewer: TimelineFeedList_viewer
  relay: RelayPaginationProp
}

class TimelineFeedList extends Component<Props> {
  intersectionObserver!: IntersectionObserver
  lastItemRef?: HTMLDivElement
  constructor (props: Props) {
    super(props)
    this.intersectionObserver = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.intersectionRatio > 0) {
        this.loadMore()
      }
    })
  }

  componentWillUnmount (): void {
    this.intersectionObserver.disconnect()
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
        <div
          ref={(c) => {
            if (c) {
              this.intersectionObserver.observe(c)
              this.lastItemRef = c
            } else {
              this.intersectionObserver.unobserve(this.lastItemRef!)
            }
          }}
        />
      </div>
    )
  }
}

export default createPaginationContainer(
  TimelineFeedList,
  {
    viewer: graphql`
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
    `
  },
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
