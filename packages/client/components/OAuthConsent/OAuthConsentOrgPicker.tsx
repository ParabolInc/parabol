import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {OAuthConsentOrgPicker_request$key} from '../../__generated__/OAuthConsentOrgPicker_request.graphql'
import {cn} from '../../ui/cn'
import OAuthConsentOrgFilter from './OAuthConsentOrgFilter'
import OAuthConsentOrgModeRadios from './OAuthConsentOrgModeRadios'
import OAuthConsentOrgRow from './OAuthConsentOrgRow'
import OAuthConsentPrivateRow from './OAuthConsentPrivateRow'
import type {OAuthConsentChoice} from './useOAuthConsentChoice'

const MAX_UNFILTERED_ORGS = 5

interface Props {
  requestRef: OAuthConsentOrgPicker_request$key
  choice: OAuthConsentChoice
}

const OAuthConsentOrgPicker = ({requestRef, choice}: Props) => {
  const request = useFragment(
    graphql`
      fragment OAuthConsentOrgPicker_request on OAuthAuthorizationRequest {
        organization {
          name
        }
        organizations {
          ...OAuthConsentOrgRow_organization
          blockedReason
          organization {
            id
            name
          }
        }
      }
    `,
    requestRef
  )
  const [filter, setFilter] = useState('')
  const {organization, organizations} = request
  const allowedCount = organizations.filter(({blockedReason}) => !blockedReason).length
  const isMany = organizations.length > MAX_UNFILTERED_ORGS
  const normalizedFilter = filter.trim().toLowerCase()
  const visibleOrganizations = organizations.filter((row) =>
    row.organization.name.toLowerCase().includes(normalizedFilter)
  )
  return (
    <section aria-labelledby='oauth-consent-orgs' className='flex flex-col gap-3'>
      <h3
        id='oauth-consent-orgs'
        className='m-0 font-semibold text-fg-muted text-xs uppercase tracking-wider'
      >
        Organizations
      </h3>
      {organization ? (
        <p className='wrap-anywhere m-0'>Only {organization.name}, which registered it.</p>
      ) : (
        <>
          {allowedCount > 0 && (
            <OAuthConsentOrgModeRadios
              orgMode={choice.orgMode}
              onOrgModeChange={choice.setOrgMode}
            />
          )}
          {isMany && (
            <OAuthConsentOrgFilter
              orgCount={organizations.length}
              blockedCount={organizations.length - allowedCount}
              filter={filter}
              onFilterChange={setFilter}
            />
          )}
          <div
            role='list'
            aria-label='Your organizations'
            className={cn(
              'flex flex-col rounded-md border border-hairline',
              isMany && 'max-h-64 overflow-y-auto'
            )}
          >
            {visibleOrganizations.map((row) => (
              <OAuthConsentOrgRow
                key={row.organization.id}
                organizationRef={row}
                isPicking={choice.orgMode === 'pick'}
                isPicked={choice.pickedOrgIds.includes(row.organization.id)}
                onTogglePicked={choice.togglePickedOrg}
              />
            ))}
          </div>
          <OAuthConsentPrivateRow
            isIncluded={choice.includePrivate}
            onIncludedChange={choice.setIncludePrivate}
          />
        </>
      )}
    </section>
  )
}

export default OAuthConsentOrgPicker
