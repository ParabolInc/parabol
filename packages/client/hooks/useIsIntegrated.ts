import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {useIsIntegrated_teamMember$key} from '../__generated__/useIsIntegrated_teamMember.graphql'
import {isTaskClientIntegration} from '../integrations/platform/registry'

export const makePlaceholder = (connectedServices: readonly {title: string}[]) =>
  `Search ${connectedServices.map(({title}) => title).join(' & ')}`

export const useIsIntegrated = (teamMemberRef?: useIsIntegrated_teamMember$key | null) => {
  const teamMember = useFragment(
    graphql`
      fragment useIsIntegrated_teamMember on TeamMember {
        services {
          service
          title
          isConnected
        }
      }
    `,
    teamMemberRef ?? null
  )
  if (!teamMember) {
    return null
  }
  const connectedServices = teamMember.services.filter(
    ({service, isConnected}) => isConnected && isTaskClientIntegration(service)
  )
  return connectedServices.length > 0 ? connectedServices : null
}
