import {Outlet, useMatchRoute, useNavigate} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {Suspense, useEffect, useMemo} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import ErrorBoundary from '~/components/ErrorBoundary'
import type {TeamContainerQuery} from '../../../../__generated__/TeamContainerQuery.graphql'
import Team from '../../components/Team/Team'
import {TeamOutletContext} from './useTeamOutlet'

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
  const matchRoute = useMatchRoute()
  const {pathname} = window.location
  const teamOutlet = useMemo(() => (team ? {team, teamId} : null), [team, teamId])
  useEffect(() => {
    if (!canAccessTeam) {
      navigate({
        href: `/invitation-required?redirectTo=${pathname}&teamId=${teamId}`,
        replace: true
      })
    }
  }, [canAccessTeam])
  if (!teamOutlet) return null
  const isSettings = Boolean(matchRoute({to: '/team/$teamId/settings'}))
  return (
    <ErrorBoundary>
      <Team isSettings={isSettings} team={teamOutlet.team}>
        <Suspense fallback={''}>
          <TeamOutletContext.Provider value={teamOutlet}>
            <Outlet />
          </TeamOutletContext.Provider>
        </Suspense>
      </Team>
    </ErrorBoundary>
  )
}

export default TeamContainer
