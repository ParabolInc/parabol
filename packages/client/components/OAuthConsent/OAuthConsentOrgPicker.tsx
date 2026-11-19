import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {OAuthConsentOrgPicker_request$key} from '../../__generated__/OAuthConsentOrgPicker_request.graphql'
import {cn} from '../../ui/cn'
import OAuthConsentOrgFilter from './OAuthConsentOrgFilter'
import OAuthConsentOrgModeRadios from './OAuthConsentOrgModeRadios'
import OAuthConsentOrgRow from './OAuthConsentOrgRow'
import OAuthConsentPrivateRow from './OAuthConsentPrivateRow'
import toPossessive from './toPossessive'
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
        name
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
  const {name: appName, organization, organizations} = request
  const allowedOrgNames = organizations
    .filter(({blockedReason}) => !blockedReason)
    .map((row) => row.organization.name)
  const isMany = organizations.length > MAX_UNFILTERED_ORGS
  const normalizedFilter = filter.trim().toLowerCase()
  const visibleOrganizations = organizations.filter((row) =>
    row.organization.name.toLowerCase().includes(normalizedFilter)
  )
  return (
    <section aria-labelledby='oauth-consent-orgs' className='flex flex-col gap-2 text-sm'>
      <h2
        id='oauth-consent-orgs'
        className='m-0 font-semibold text-fg-muted text-xs uppercase leading-4 tracking-[0.08em]'
      >
        {organization || allowedOrgNames.length > 0
          ? 'Which organizations it can reach'
          : 'Your organizations'}
      </h2>
      {organization ? (
        <p className='wrap-anywhere m-0'>
          It was registered by {organization.name}, so it can only reach{' '}
          {toPossessive(organization.name)} teams and pages.
        </p>
      ) : (
        <>
          {allowedOrgNames.length > 0 && (
            <OAuthConsentOrgModeRadios
              appName={appName}
              allowedOrgNames={allowedOrgNames}
              orgMode={choice.orgMode}
              onOrgModeChange={choice.setOrgMode}
            />
          )}
          {isMany && (
            <OAuthConsentOrgFilter
              orgCount={organizations.length}
              blockedCount={organizations.length - allowedOrgNames.length}
              filter={filter}
              onFilterChange={setFilter}
            />
          )}
          <div
            role='list'
            aria-label='Your organizations'
            className={cn(
              'flex flex-col',
              isMany
                ? 'max-h-[248px] overflow-y-auto rounded-lg border border-hairline-strong px-3 pb-2'
                : 'mt-2 border-hairline border-t'
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
