import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {OrgAIAppConnections_organization$key} from '../../../../__generated__/OrgAIAppConnections_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import getEffectiveAIAppsPolicy from './getEffectiveAIAppsPolicy'
import isAIAppGrantBlocked from './isAIAppGrantBlocked'
import OrgAIAppConnectionRow from './OrgAIAppConnectionRow'
import OrgAIAppConnectionsFilter from './OrgAIAppConnectionsFilter'
import OrgAIAppsEmptyState from './OrgAIAppsEmptyState'
import OrgAIAppsNoAppsBanner from './OrgAIAppsNoAppsBanner'

interface Props {
  organizationRef: OrgAIAppConnections_organization$key
}

const OrgAIAppConnections = ({organizationRef}: Props) => {
  const organization = useFragment(
    graphql`
      fragment OrgAIAppConnections_organization on Organization {
        id
        name
        useAI
        aiAppsPolicy
        aiAppGrants {
          ...OrgAIAppConnectionRow_grant
          id
          clientName
          clientVerifiedAt
          user {
            id
            preferredName
          }
        }
      }
    `,
    organizationRef
  )
  const {id: orgId, name, useAI, aiAppsPolicy, aiAppGrants} = organization
  const [filter, setFilter] = useState('')
  const effectivePolicy = getEffectiveAIAppsPolicy(aiAppsPolicy, useAI)
  const normalizedFilter = filter.trim().toLowerCase()
  const visibleGrants = aiAppGrants.filter(
    ({clientName, user}) =>
      clientName.toLowerCase().includes(normalizedFilter) ||
      user.preferredName.toLowerCase().includes(normalizedFilter)
  )
  const controls = aiAppGrants.length > 0 && (
    <OrgAIAppConnectionsFilter
      connectionCount={aiAppGrants.length}
      memberCount={new Set(aiAppGrants.map(({user}) => user.id)).size}
      filter={filter}
      onFilterChange={setFilter}
    />
  )
  return (
    <Panel className='max-w-[976px]' label='App connections' controls={controls}>
      {aiAppGrants.length === 0 ? (
        <OrgAIAppsEmptyState orgName={name} />
      ) : (
        <>
          {effectivePolicy === 'NONE' && <OrgAIAppsNoAppsBanner orgName={name} />}
          <div className='overflow-x-auto border-hairline border-t'>
            <table className='w-full border-collapse text-sm'>
              <thead>
                <tr className='border-hairline border-b bg-surface-raised text-left text-fg-muted text-xs uppercase tracking-wider'>
                  <th className='px-4 py-2 font-semibold'>Member</th>
                  <th className='px-4 py-2 font-semibold'>App</th>
                  <th className='px-4 py-2 font-semibold'>Can do</th>
                  <th className='px-4 py-2 font-semibold'>Connected</th>
                  <th className='px-4 py-2 font-semibold'>Last used</th>
                  <th className='px-4 py-2'>
                    <span className='sr-only'>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleGrants.map((grant) => (
                  <OrgAIAppConnectionRow
                    key={grant.id}
                    grantRef={grant}
                    isBlocked={isAIAppGrantBlocked(effectivePolicy, grant.clientVerifiedAt)}
                    orgId={orgId}
                    orgName={name}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Panel>
  )
}

export default OrgAIAppConnections
