import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {OrgAuthenticationSignOnUrl_saml$key} from '../../../../__generated__/OrgAuthenticationSignOnUrl_saml.graphql'
import makeAppURL from '../../../../utils/makeAppURL'
import {CopyServiceProviderURL} from './CopyServiceProviderURL'

interface Props {
  samlRef: OrgAuthenticationSignOnUrl_saml$key | null
}

const OrgAuthenticationSignOutUrl = (props: Props) => {
  const {samlRef} = props
  const saml = useFragment(
    graphql`
      fragment OrgAuthenticationSignOnUrl_saml on SAML {
        id
      }
    `,
    samlRef
  )
  const domain = saml?.id ?? 'XXXX-XXXX'
  const startURL = window.location.origin
  const acsURL = makeAppURL(startURL, `/saml/${domain}`)
  const entityId = makeAppURL(startURL, `/saml-metadata/${domain}`)
  return (
    <>
      <div className='px-6 pb-3'>
        <div className='flex text-base leading-6 font-semibold text-slate-700'>
          Set up your Identity Provider
        </div>
        <div className={'flex items-center text-sm text-slate-700'}>
          Paste the following URLs into your Identity Provider’s SAML configuration
        </div>
      </div>
      <div className='column-ga grid grid-cols-[max-content_fit-content(300px)_24px] items-center gap-x-2 px-6 pb-8'>
        <CopyServiceProviderURL url={acsURL} label={'ACS URL'} />
        <CopyServiceProviderURL url={entityId} label={'Entity ID'} />
        <CopyServiceProviderURL url={startURL} label={'Start URL'} />
      </div>
    </>
  )
}

export default OrgAuthenticationSignOutUrl
