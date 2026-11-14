import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {CheckCircle, ErrorOutline, KeyboardArrowDown, KeyboardArrowUp} from '~/ui/icons'
import type {OrgAuthenticationIdP_saml$key} from '../../../../__generated__/OrgAuthenticationIdP_saml.graphql'
import {cn} from '../../../../ui/cn'
import OrgAuthenticationMetadata from './OrgAuthenticationMetadata'
import OrgAuthenticationSCIM from './OrgAuthenticationSCIM'
import OrgAuthenticationSignOnUrl from './OrgAuthenticationSignOnUrl'

interface Props {
  samlRef: OrgAuthenticationIdP_saml$key
  isOrgAdmin: boolean
  scimEnabled: boolean
  isOpen: boolean
  onToggle: () => void
}

const OrgAuthenticationIdP = (props: Props) => {
  const {samlRef, isOrgAdmin, scimEnabled, isOpen, onToggle} = props
  const saml = useFragment(
    graphql`
      fragment OrgAuthenticationIdP_saml on SAML {
        id
        domains
        metadataURL
        ...OrgAuthenticationSignOnUrl_saml
        ...OrgAuthenticationMetadata_saml
        ...OrgAuthenticationSCIM_saml
      }
    `,
    samlRef
  )
  const {id, domains, metadataURL} = saml
  const isActive = !!metadataURL
  const StatusIcon = isActive ? CheckCircle : ErrorOutline
  const ToggleIcon = isOpen ? KeyboardArrowUp : KeyboardArrowDown
  return (
    <div className='border-hairline border-b last:border-b-0'>
      <button
        type='button'
        aria-expanded={isOpen}
        onClick={onToggle}
        className='flex w-full cursor-pointer items-center gap-4 border-none bg-transparent px-6 py-4 text-left font-sans hover:bg-surface-hover'
      >
        <StatusIcon
          className={cn(
            'size-6 shrink-0',
            isActive ? 'text-jade-600 dark:text-jade-300' : 'text-gold-600 dark:text-gold-300'
          )}
        />
        <span className='flex min-w-0 flex-1 flex-col gap-1.5'>
          <span className='font-semibold text-base text-fg-primary leading-6'>{id}</span>
          <span className='flex flex-wrap gap-2'>
            {domains.map((domain) => (
              <span
                key={domain}
                className='w-max select-none rounded-full bg-surface-well px-3 py-1 font-semibold text-fg-primary text-xs'
              >
                {domain}
              </span>
            ))}
          </span>
        </span>
        <span className='shrink-0 text-fg-secondary text-sm'>
          {isActive ? 'Active' : 'Needs metadata'}
        </span>
        <ToggleIcon className='size-6 shrink-0 text-fg-secondary' />
      </button>
      {isOpen && (
        <div key={metadataURL ?? 'disconnected'} className='border-hairline border-t pt-6 pl-10'>
          <OrgAuthenticationSignOnUrl samlRef={saml} />
          <OrgAuthenticationMetadata samlRef={saml} isOrgAdmin={isOrgAdmin} />
          <div className='border-hairline border-t pt-5'>
            <div className='px-6 pb-3 font-semibold text-base text-fg-primary leading-6'>
              SCIM Provisioning
            </div>
            <OrgAuthenticationSCIM
              samlRef={saml}
              scimEnabled={scimEnabled}
              isOrgAdmin={isOrgAdmin}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default OrgAuthenticationIdP
