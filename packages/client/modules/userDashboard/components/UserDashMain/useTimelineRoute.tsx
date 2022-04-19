import {useEffect} from 'react'
import {useQueryLoader} from 'react-relay'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {JSResource} from '../../../../routing'
import myDashboardTimelineQuery, {
  MyDashboardTimelineQuery
} from '../../../../__generated__/MyDashboardTimelineQuery.graphql'

export function useTimelineRoute() {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const [timelineQueryRef, loadQuery] =
    useQueryLoader<MyDashboardTimelineQuery>(myDashboardTimelineQuery)

  useEffect(() => {
    if (!timelineQueryRef) {
      // via [Introducing Relay Hooks | Relay](https://relay.dev/blog/2021/03/09/introducing-relay-hooks/#starting-to-fetch-data-before-rendering-a-component)
      // calling loadQuery will cause this component to re-render.
      // During that re-render, queryReference will be defined.
      loadQuery({
        first: 10,
        userIds: [viewerId]
      })
    }
  }, [viewerId, timelineQueryRef, loadQuery])

  return {
    path: '/me',
    exact: true,
    component: JSResource(
      'MyDashboardTimeline',
      () => import('../../../../components/MyDashboardTimeline')
    ),
    prepare: () => ({
      queryRef: timelineQueryRef
    })
  }
}
