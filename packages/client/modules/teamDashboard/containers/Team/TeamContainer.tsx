import graphql from 'babel-plugin-relay/macro'
import {lazy, Suspense, useEffect} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {matchPath, Route, Routes, useNavigate} from 'react-router-dom'
import ErrorBoundary from '~/components/ErrorBoundary'
import type {TeamContainerQuery} from '../../../../__generated__/TeamContainerQuery.graphql'
import Team from '../../components/Team/Team'

const TeamDashMain = lazy(
  () => import(/* webpackChunkName: 'TeamDashMainRoot' */ '../../components/TeamDashMainRoot')
)
const TeamSettings = lazy(
  () => import(/* webpackChunkName: 'TeamIntegrationsRoot' */ '../../components/TeamSettingsRoot')
)
const ArchivedTasks = lazy(
  () => import(/* webpackChunkName: 'ArchiveTaskRoot' */ '../../../../components/ArchiveTaskRoot')
)

interface Props {
  teamId: string
  queryRef: PreloadedQuery<TeamContainerQuery>
}

const TeamContainer = (props: Props) => {
  const {teamId, queryRef} = props
  const data = usePreloadedQuery<TeamContainerQuery>(
    graphql`
      query TeamContainerQuery($teamId: ID!) {
        viewer {
          canAccessTeam: canAccess(entity: Team, id: $teamId)
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
  const {team, canAccessTeam} = viewer
  const navigate = useNavigate()
  const {location} = window
  const {pathname} = location
  useEffect(() => {
    if (!canAccessTeam) {
      navigate(
        {
          pathname: `/invitation-required`,
          search: `?redirectTo=${pathname}&teamId=${teamId}`
        },
        {replace: true}
      )
    }
  }, [canAccessTeam])
  if (!team) return null

  const isSettings = Boolean(matchPath('/team/:teamId/settings', pathname))
  return (
    <ErrorBoundary>
      <Team isSettings={isSettings} team={team}>
        <Suspense fallback={''}>
          <Routes>
            <Route path='settings' element={<TeamSettings teamId={teamId} />} />
            <Route
              path='archive'
              element={<ArchivedTasks team={team} returnToTeamId={teamId} teamIds={[teamId]} />}
            />
            <Route path='*' element={<TeamDashMain />} />
          </Routes>
        </Suspense>
      </Team>
    </ErrorBoundary>
  )
}

export default TeamContainer
