import graphql from 'babel-plugin-relay/macro'
import {forwardRef, type HTMLAttributes, type Ref, Suspense} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useDocumentTitle from '~/hooks/useDocumentTitle'
import type {MyDashboardTimelineQuery} from '../__generated__/MyDashboardTimelineQuery.graphql'
import {cn} from '../ui/cn'
import ErrorBoundary from './ErrorBoundary'
import TimelineFeedList from './TimelineFeedList'
import TimelineHeader from './TimelineHeader'
import TimelineLoadingEvents from './TimelineLoadingEvents'
import TimelineRightDrawer from './TimelineRightDrawer'
import TimelineSuggestedAction from './TimelineSuggestedAction'

interface Props {
  queryRef: PreloadedQuery<MyDashboardTimelineQuery>
}

export const TimelineFeedItems = forwardRef(
  (props: HTMLAttributes<HTMLDivElement>, ref: Ref<HTMLDivElement>) => {
    const {className, children, ...rest} = props
    return (
      <div {...rest} ref={ref} className={cn('w-full min-w-[296px] max-w-[600px]', className)}>
        {children}
      </div>
    )
  }
)

const MyDashboardTimeline = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<MyDashboardTimelineQuery>(
    graphql`
      query MyDashboardTimelineQuery(
        $first: Int!
        $after: DateTime
        $userIds: [ID!]
        $eventTypes: [TimelineEventEnum!]
        $teamIds: [ID!]
        $archived: Boolean
      ) {
        viewer {
          ...TimelineSuggestedAction_viewer
          ...TimelineRightDrawer_viewer
          ...TimelineHeader_viewer
        }
        ...TimelineFeedList_query
      }
    `,
    queryRef
  )
  const {viewer} = data
  useDocumentTitle('My History | Parabol', 'History')
  return (
    <div className='flex'>
      <div className='flex h-auto flex-1 justify-center px-4 pt-4'>
        <TimelineFeedItems>
          <TimelineHeader viewerRef={viewer} />
          <ErrorBoundary>
            <Suspense fallback={<TimelineLoadingEvents />}>
              <TimelineSuggestedAction viewer={viewer} />
              <TimelineFeedList queryRef={data} />
            </Suspense>
          </ErrorBoundary>
        </TimelineFeedItems>
      </div>
      <TimelineRightDrawer viewer={viewer} />
    </div>
  )
}

export default MyDashboardTimeline
