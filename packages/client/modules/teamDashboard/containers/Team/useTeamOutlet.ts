import {createContext, useContext} from 'react'
import type {TeamContainerQuery} from '../../../../__generated__/TeamContainerQuery.graphql'

interface TeamOutlet {
  team: NonNullable<TeamContainerQuery['response']['viewer']['team']>
  teamId: string
}

export const TeamOutletContext = createContext<TeamOutlet | null>(null)

const useTeamOutlet = () => {
  const outlet = useContext(TeamOutletContext)
  if (!outlet) throw new Error('useTeamOutlet must be used under the team route')
  return outlet
}

export default useTeamOutlet
