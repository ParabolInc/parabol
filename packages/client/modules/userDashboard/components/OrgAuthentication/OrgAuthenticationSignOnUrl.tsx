import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {OrgAuthenticationSignOnUrl_saml$key} from '../../../../__generated__/OrgAuthenticationSignOnUrl_saml.graphql'
import makeAppURL from '../../../../utils/makeAppURL'
import {CopyServiceProviderURL} from './CopyServiceProviderURL'

const Section = styled('div')({
  padding: '0px 28px 12px 28px'
})

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
      <Section>
        <div className='flex text-base font-semibold leading-6 text-slate-700'>
          Set up your Identity Provider
        </div>
        <div className={'flex items-center text-sm text-slate-700'}>
          Paste the following URLs into your Identity Provider’s SAML configuration
        </div>
      </Section>
      <div className='flex flex-col p-7 pt-3 pb-0 font-bold'>
        <CopyServiceProviderURL url={acsURL} label={'ACS URL    '} />
        <CopyServiceProviderURL url={entityId} label={'Entity ID'} />
        <CopyServiceProviderURL url={startURL} label={'Start URL'} />
      </div>
    </>
  )
}

export default OrgAuthenticationSignOutUrl
