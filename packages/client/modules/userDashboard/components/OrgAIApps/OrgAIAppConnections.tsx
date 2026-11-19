import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {OrgAIAppConnections_organization$key} from '../../../../__generated__/OrgAIAppConnections_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import plural from '../../../../utils/plural'
import getEffectiveAIAppsPolicy from './getEffectiveAIAppsPolicy'
import isAIAppGrantBlocked from './isAIAppGrantBlocked'
import OrgAIAppConnectionRow from './OrgAIAppConnectionRow'
import OrgAIAppConnectionsFilter, {type AIAppStatusFilter} from './OrgAIAppConnectionsFilter'
import OrgAIAppConnectionsTable from './OrgAIAppConnectionsTable'
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
  const [status, setStatus] = useState<AIAppStatusFilter>('all')
  const [filter, setFilter] = useState('')
  const effectivePolicy = getEffectiveAIAppsPolicy(aiAppsPolicy, useAI)
  const connectionCount = aiAppGrants.length
  const memberCount = new Set(aiAppGrants.map(({user}) => user.id)).size
  const verifiedCount = aiAppGrants.filter(({clientVerifiedAt}) => clientVerifiedAt).length
  const normalizedFilter = filter.trim().toLowerCase()
  const visibleGrants = aiAppGrants.filter(({clientName, clientVerifiedAt, user}) => {
    const matchesStatus =
      status === 'all' || (status === 'verified' ? !!clientVerifiedAt : !clientVerifiedAt)
    const matchesKeyword =
      clientName.toLowerCase().includes(normalizedFilter) ||
      user.preferredName.toLowerCase().includes(normalizedFilter)
    return matchesStatus && matchesKeyword
  })
  const controls = connectionCount > 0 && (
    <span className='whitespace-nowrap text-fg-secondary'>
      {connectionCount} {plural(connectionCount, 'connection')} · {memberCount}{' '}
      {plural(memberCount, 'member')}
    </span>
  )
  return (
    <Panel className='max-w-[976px]' label='App connections' controls={controls}>
      {connectionCount === 0 ? (
        <OrgAIAppsEmptyState orgName={name} />
      ) : (
        <>
          {effectivePolicy === 'NONE' && <OrgAIAppsNoAppsBanner orgName={name} />}
          <OrgAIAppConnectionsFilter
            counts={{
              all: connectionCount,
              verified: verifiedCount,
              unverified: connectionCount - verifiedCount
            }}
            status={status}
            onStatusChange={setStatus}
            filter={filter}
            onFilterChange={setFilter}
          />
          <OrgAIAppConnectionsTable isEmpty={visibleGrants.length === 0}>
            {visibleGrants.map((grant) => (
              <OrgAIAppConnectionRow
                key={grant.id}
                grantRef={grant}
                isBlocked={isAIAppGrantBlocked(effectivePolicy, grant.clientVerifiedAt)}
                orgId={orgId}
                orgName={name}
              />
            ))}
          </OrgAIAppConnectionsTable>
        </>
      )}
    </Panel>
  )
}

export default OrgAIAppConnections
