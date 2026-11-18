import {lazyRouteComponent} from '@tanstack/react-router'

// The router preloads these beside each page's data. Once loaded they render without suspending, unlike React.lazy,
// which suspends on its first render even when its chunk is in memory

// The editor stack is a third of the entry bundle & the sign in pages do not use it
export const TipTapLayout = lazyRouteComponent(
  () => import(/* webpackChunkName: 'TipTapLayout' */ '../components/TipTapLayout')
)
export const DashboardRoot = lazyRouteComponent(
  () => import(/* webpackChunkName: 'DashboardRoot' */ '../components/DashboardRoot')
)
export const MeetingsDash = lazyRouteComponent(
  () => import(/* webpackChunkName: 'MeetingsDash' */ '../components/MeetingsDash')
)
export const TeamRoot = lazyRouteComponent(
  () => import(/* webpackChunkName: 'TeamRoot' */ '../modules/teamDashboard/components/TeamRoot')
)
export const TeamDashMainRoot = lazyRouteComponent(
  () =>
    import(
      /* webpackChunkName: 'TeamDashMainRoot' */ '../modules/teamDashboard/components/TeamDashMainRoot'
    )
)
