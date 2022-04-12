import {RouteComponentProps} from 'react-router'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import {JSResource} from '../../../../routing'
import myDashboardTimelineQuery, {
  MyDashboardTimelineQuery
} from '../../../../__generated__/MyDashboardTimelineQuery.graphql'

export function useTimelineRoute(match: RouteComponentProps['match']) {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const timelineQueryRef = useQueryLoaderNow<MyDashboardTimelineQuery>(myDashboardTimelineQuery, {
    first: 10,
    userIds: [viewerId]
  })

  return {
    path: match.url,
    exact: true,
    component: JSResource(
      'MyDashboardTimeline',
      () => import('../../../../components/MyDashboardTimeline')
    ),
    prepare: () => ({queryRef: timelineQueryRef})
  }
}
