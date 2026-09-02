import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {useIsIntegrated_teamMember$key} from '../__generated__/useIsIntegrated_teamMember.graphql'

export const makePlaceholder = (connectedServices: readonly {title: string}[]) =>
  `Search ${connectedServices.map(({title}) => title).join(' & ')}`

export const useIsIntegrated = (teamMemberRef?: useIsIntegrated_teamMember$key | null) => {
  const teamMember = useFragment(
    graphql`
      fragment useIsIntegrated_teamMember on TeamMember {
        services {
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
  const connectedServices = teamMember.services.filter(({isConnected}) => isConnected)
  return connectedServices.length > 0 ? connectedServices : null
}
