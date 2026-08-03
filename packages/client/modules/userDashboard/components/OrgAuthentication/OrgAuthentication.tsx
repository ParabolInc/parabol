import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {OrgAuthenticationQuery} from '../../../../__generated__/OrgAuthenticationQuery.graphql'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import Panel from '../../../../components/Panel/Panel'
import {ElementWidth} from '../../../../types/constEnums'
import OAuthProviderList from '../OrgIntegrations/OAuthProviderList'
import OrgAuthenticationMetadata from './OrgAuthenticationMetadata'
import OrgAuthenticationSCIM from './OrgAuthenticationSCIM'
import OrgAuthenticationSignOnUrl from './OrgAuthenticationSignOnUrl'
import OrgAuthenticationSSOFrame from './OrgAuthenticationSSOFrame'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH
})

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
            saml {
              ...OrgAuthenticationSSOFrame_saml
              ...OrgAuthenticationSignOnUrl_saml
              ...OrgAuthenticationSCIM_saml
              ...OrgAuthenticationMetadata_saml
              id
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
  const {viewer} = data
  const {organization} = viewer
  if (!organization) {
    return null
  }
  const {saml = null, isOrgAdmin, showOAuthProvider, scimEnabled} = organization
  const disabled = !saml

  return (
    <div className='space-y-6'>
      <StyledPanel>
        <LabelHeading className='px-6 pt-4 pb-2'>SAML Single Sign-On</LabelHeading>
        <div className='border-hairline border-t pt-6'>
          <OrgAuthenticationSSOFrame samlRef={saml} />
          <div className={disabled ? 'pointer-events-none select-none' : ''}>
            <OrgAuthenticationSignOnUrl samlRef={saml} />
            <OrgAuthenticationMetadata samlRef={saml} isOrgAdmin={isOrgAdmin} />
          </div>
        </div>
      </StyledPanel>

      <StyledPanel>
        <LabelHeading className='px-6 pt-4 pb-2'>SCIM Provisioning</LabelHeading>
        <div className='border-hairline border-t pt-6'>
          <OrgAuthenticationSCIM
            samlRef={saml}
            scimEnabled={!!scimEnabled}
            isOrgAdmin={isOrgAdmin}
          />
        </div>
      </StyledPanel>

      {showOAuthProvider && (
        <StyledPanel>
          <LabelHeading className='px-6 pt-4 pb-2'>OAuth 2.0 API</LabelHeading>
          <div className='border-hairline border-t px-6 pt-6 pb-6'>
            <div className='mb-6 text-base text-fg-primary'>
              Configure your organization as an OAuth 2.0 provider to allow external applications to
              authenticate with your Parabol organization.
            </div>
            <OAuthProviderList organizationRef={organization} />
          </div>
        </StyledPanel>
      )}
    </div>
  )
}

export default OrgAuthentication
