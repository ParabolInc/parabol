import React, {lazy, Suspense} from 'react'
import {useTranslation} from 'react-i18next'
import {Route, RouteComponentProps, Switch} from 'react-router'
import DashContent from '~/components/Dashboard/DashContent'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'
import StartMeetingFAB from '../../../../components/StartMeetingFAB'
import {LoaderSize} from '../../../../types/constEnums'

interface Props extends RouteComponentProps {}

const UserTaskViewRoot = lazy(
  () =>
    import(/* webpackChunkName: 'MyDashboardTasksRoot' */ '../../../../components/UserTaskViewRoot')
)
const MyDashboardTimelineRoot = lazy(
  () =>
    import(
      /* webpackChunkName: 'MyDashboardTimelineRoot' */ '../../../../components/MyDashboardTimelineRoot'
    )
)

const UserDashMain = (props: Props) => {
  const {match} = props

  const {t} = useTranslation()

  return (
    <DashContent>
      <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.PANEL} />}>
        <Switch>
          <Route
            path={t('UserDashMain.MatchUrlTasks', {
              matchUrl: match.url
            })}
            component={UserTaskViewRoot}
          />
          <Route path={match.url} component={MyDashboardTimelineRoot} />
        </Switch>
      </Suspense>
      <StartMeetingFAB />
    </DashContent>
  )
}

export default UserDashMain
