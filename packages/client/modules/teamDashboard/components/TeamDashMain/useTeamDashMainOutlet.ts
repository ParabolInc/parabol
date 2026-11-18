import {createContext, useContext} from 'react'
import type {TeamDashMainQuery} from '../../../../__generated__/TeamDashMainQuery.graphql'

type TeamDashMainViewer = TeamDashMainQuery['response']['viewer']

interface TeamDashMainOutlet {
  viewer: TeamDashMainViewer
  team: NonNullable<TeamDashMainViewer['team']>
  teamId: string
}

export const TeamDashMainOutletContext = createContext<TeamDashMainOutlet | null>(null)

const useTeamDashMainOutlet = () => {
  const outlet = useContext(TeamDashMainOutletContext)
  if (!outlet) throw new Error('useTeamDashMainOutlet must be used under the team dashboard route')
  return outlet
}

export default useTeamDashMainOutlet
