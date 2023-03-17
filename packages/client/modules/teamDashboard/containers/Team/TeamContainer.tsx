import graphql from 'babel-plugin-relay/macro'
import React, {lazy, Suspense, useEffect} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Route} from 'react-router'
import {matchPath, Switch} from 'react-router-dom'
import ErrorBoundary from '~/components/ErrorBoundary'
import useRouter from '../../../../hooks/useRouter'
import {TeamContainerQuery} from '../../../../__generated__/TeamContainerQuery.graphql'
import Team from '../../components/Team/Team'

const TeamDashMain = lazy(
  () => import(/* webpackChunkName: 'TeamDashMainRoot' */ '../../components/TeamDashMainRoot')
)
const TeamSettings = lazy(
  () =>
    import(
      /* webpackChunkName: 'TeamSettingsWrapper' */ '../../components/TeamSettingsWrapper/TeamSettingsWrapper'
    )
)
const ArchivedTasks = lazy(
  () => import(/* webpackChunkName: 'ArchiveTaskRoot' */ '../../../../components/ArchiveTaskRoot')
)

interface Props {
  teamId: string
  queryRef: PreloadedQuery<TeamContainerQuery>
  // not sure if we still need these, but not trying to break stuff during the Relay Refactor
  location: any
  match: any
}

const TeamContainer = (props: Props) => {
  const {teamId, queryRef} = props
  const data = usePreloadedQuery<TeamContainerQuery>(
    graphql`
      query TeamContainerQuery($teamId: ID!) {
        viewer {
          team(teamId: $teamId) {
            ...Team_team
            ...TeamArchive_team
            name
          }
        }
      }
    `,
    queryRef
  )
  const {viewer} = data
  const {team} = viewer
  const {history, match} = useRouter()
  const {location} = window
  const {pathname} = location
  useEffect(() => {
    if (!team) {
      history.replace({
        pathname: `/invitation-required`,
        search: `?redirectTo=${encodeURIComponent(pathname)}&teamId=${teamId}`
      })
    }
  })
  if (!team) return null

  const isSettings = Boolean(
    matchPath(pathname, {
      path: '/team/:teamId/settings'
    })
  )
  return (
    <ErrorBoundary>
      <Team isSettings={isSettings} team={team}>
        <Suspense fallback={''}>
          <Switch>
            {/* TODO: replace match.path with a relative when the time comes: https://github.com/ReactTraining/react-router/pull/4539 */}
            <Route exact path={match.path} component={TeamDashMain} />
            <Route path={`${match.path}/settings`} component={TeamSettings} />
            <Route
              path={`${match.path}/archive`}
              render={(p) => (
                <ArchivedTasks {...p} team={team} returnToTeamId={teamId} teamIds={[teamId]} />
              )}
            />
          </Switch>
        </Suspense>
      </Team>
    </ErrorBoundary>
  )
}

export default TeamContainer
