import {useQueryLoader} from 'react-relay'
import {JSResource} from '../routing'
import myDashboardTimelineQuery, {
  MyDashboardTimelineQuery
} from '../__generated__/MyDashboardTimelineQuery.graphql'
import useAtmosphere from './useAtmosphere'

export function useTimelineRoute(path: string) {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const [timelineQueryRef, loadQuery] =
    useQueryLoader<MyDashboardTimelineQuery>(myDashboardTimelineQuery)

  return {
    path,
    exact: true,
    component: JSResource('MyDashboardTimeline', () => import('../components/MyDashboardTimeline')),
    prepare: () => {
      if (!timelineQueryRef) {
        loadQuery({
          first: 10,
          userIds: [viewerId]
        })
      }
      return {
        queryRef: timelineQueryRef
      }
    }
  }
}
