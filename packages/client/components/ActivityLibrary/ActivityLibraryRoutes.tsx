import {lazy} from 'react'
import {Route, Switch, useRouteMatch} from 'react-router'
import useSubscription from '../../hooks/useSubscription'
import NotificationSubscription from '../../subscriptions/NotificationSubscription'
import OrganizationSubscription from '../../subscriptions/OrganizationSubscription'
import TaskSubscription from '../../subscriptions/TaskSubscription'
import TeamSubscription from '../../subscriptions/TeamSubscription'

const ActivityDetailsRoute = lazy(
  () => import(/* webpackChunkName: 'ActivityDetails' */ './ActivityDetails/ActivityDetailsRoute')
)
const CreateNewActivityRoute = lazy(
  () =>
    import(
      /* webpackChunkName: 'CreateNewActivityRoute' */ './CreateNewActivity/CreateNewActivityRoute'
    )
)

const ActivityLibraryRoute = lazy(
  () => import(/* webpackChunkName: 'AcitivityLibraryRoute' */ './ActivityLibraryRoute')
)

const ActivityLibraryRoutes = () => {
  useSubscription('ActivityLibraryRoutes', NotificationSubscription)
  useSubscription('ActivityLibraryRoutes', OrganizationSubscription)
  useSubscription('ActivityLibraryRoutes', TaskSubscription)
  useSubscription('ActivityLibraryRoutes', TeamSubscription)

  const {path} = useRouteMatch()

  return (
    <Switch>
      <Route path={`${path}/new-activity/:categoryId`} component={CreateNewActivityRoute} />
      <Route path={`${path}/details/:activityId`} component={ActivityDetailsRoute} />
      <Route exact path={[path, `${path}/category/:categoryId`]} component={ActivityLibraryRoute} />
    </Switch>
  )
}

export default ActivityLibraryRoutes
