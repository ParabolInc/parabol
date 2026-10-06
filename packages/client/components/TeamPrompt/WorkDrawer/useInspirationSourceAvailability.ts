import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {useInspirationSourceAvailability_teamMember$key} from '../../../__generated__/useInspirationSourceAvailability_teamMember.graphql'
import {getConnectProvider} from '../../../integrations/platform/findIntegrationService'
import {hasJiraScopes} from '../../../utils/atlassianScopes'
import type {InspirationSourceService} from './inspirationSources'

export interface InspirationSourceAvailability {
  service: InspirationSourceService
  isConnected: boolean
}

const useInspirationSourceAvailability = (
  teamMemberRef: useInspirationSourceAvailability_teamMember$key | null | undefined
): InspirationSourceAvailability[] => {
  const teamMember = useFragment(
    graphql`
      fragment useInspirationSourceAvailability_teamMember on TeamMember {
        services {
          ...findIntegrationService_cloudProvider @relay(mask: false)
        }
        integrations {
          github {
            isActive
          }
          atlassian {
            isActive
            scope
          }
          linear {
            auth {
              isActive
            }
            cloudProvider {
              id
            }
          }
          gcal {
            auth {
              providerId
            }
            cloudProvider {
              id
            }
          }
        }
      }
    `,
    teamMemberRef
  )
  if (!teamMember) return [{service: 'PARABOL', isConnected: true}]
  const {services, integrations} = teamMember
  const {github, atlassian, linear, gcal} = integrations
  const sources: (InspirationSourceAvailability | null)[] = [
    {service: 'PARABOL', isConnected: true},
    getConnectProvider(services, 'github')
      ? {service: 'github', isConnected: !!github?.isActive}
      : null,
    getConnectProvider(services, 'jira')
      ? {service: 'jira', isConnected: !!atlassian?.isActive && hasJiraScopes(atlassian.scope)}
      : null,
    linear?.cloudProvider?.id ? {service: 'linear', isConnected: !!linear.auth?.isActive} : null,
    gcal?.cloudProvider?.id ? {service: 'gcal', isConnected: !!gcal.auth?.providerId} : null
  ]
  return sources.filter((source): source is InspirationSourceAvailability => !!source)
}

export default useInspirationSourceAvailability
