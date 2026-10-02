import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {OrgAuthenticationQuery} from '../../../../__generated__/OrgAuthenticationQuery.graphql'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import Panel from '../../../../components/Panel/Panel'
import OAuthProviderList from '../OrgIntegrations/OAuthProviderList'
import OrgAuthenticationIdP from './OrgAuthenticationIdP'
import OrgAuthenticationSSOFrame from './OrgAuthenticationSSOFrame'

interface Props {
  queryRef: PreloadedQuery<OrgAuthenticationQuery>
}
const OrgAuthentication = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<OrgAuthenticationQuery>(
    graphql`
      query OrgAuthenticationQuery($orgId: ID!) {
        viewer {
          organization(orgId: $orgId) {
            samls {
              id
              ...OrgAuthenticationSSOFrame_samls
              ...OrgAuthenticationIdP_saml
            }
            ...OAuthProviderList_organization
            isOrgAdmin
            showOAuthProvider: featureFlag(featureName: "oauthProvider")
            scimEnabled: featureFlag(featureName: "SCIM")
          }
        }
      }
    `,
    queryRef
  )
  const {organization} = data.viewer
  const samls = organization?.samls ?? []
  const [openSAMLId, setOpenSAMLId] = useState(samls.length === 1 ? samls[0]?.id : undefined)
  if (!organization) {
    return null
  }
  const {isOrgAdmin, showOAuthProvider, scimEnabled} = organization

  return (
    <div className='space-y-6'>
      <Panel className='max-w-[976px]'>
        <LabelHeading className='px-6 pt-4 pb-2'>SAML Single Sign-On</LabelHeading>
        <div className='border-hairline border-t pt-6'>
          <OrgAuthenticationSSOFrame samlsRef={samls} />
          <div className='border-hairline border-t empty:hidden'>
            {samls.map((saml) => (
              <OrgAuthenticationIdP
                key={saml.id}
                samlRef={saml}
                isOrgAdmin={isOrgAdmin}
                scimEnabled={!!scimEnabled}
                isOpen={openSAMLId === saml.id}
                onToggle={() => setOpenSAMLId(openSAMLId === saml.id ? undefined : saml.id)}
              />
            ))}
          </div>
        </div>
      </Panel>

      {showOAuthProvider && (
        <Panel className='max-w-[976px]'>
          <LabelHeading className='px-6 pt-4 pb-2'>OAuth 2.0 API</LabelHeading>
          <div className='border-hairline border-t px-6 pt-6 pb-6'>
            <div className='mb-6 text-base text-fg-primary'>
              Configure your organization as an OAuth 2.0 provider to allow external applications to
              authenticate with your Parabol organization.
            </div>
            <OAuthProviderList organizationRef={organization} />
          </div>
        </Panel>
      )}
    </div>
  )
}

export default OrgAuthentication
