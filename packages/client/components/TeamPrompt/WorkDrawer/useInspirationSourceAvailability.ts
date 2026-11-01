import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {useInspirationSourceAvailability_teamMember$key} from '../../../__generated__/useInspirationSourceAvailability_teamMember.graphql'
import listInspirationSources from './listInspirationSources'

const useInspirationSourceAvailability = (
  teamMemberRef: useInspirationSourceAvailability_teamMember$key | null | undefined
) => {
  const teamMember = useFragment(
    graphql`
      fragment useInspirationSourceAvailability_teamMember on TeamMember {
        services {
          service
          isAvailable
          isConnected
          capabilities
        }
      }
    `,
    teamMemberRef
  )
  return listInspirationSources(teamMember?.services)
}

export default useInspirationSourceAvailability
