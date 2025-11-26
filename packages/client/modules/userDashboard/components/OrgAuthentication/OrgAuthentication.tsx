import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {OrgAuthenticationQuery} from '../../../../__generated__/OrgAuthenticationQuery.graphql'
import DialogTitle from '../../../../components/DialogTitle'
import Panel from '../../../../components/Panel/Panel'
import {ElementWidth} from '../../../../types/constEnums'
import OAuthProviderList from '../OrgIntegrations/OAuthProviderList'
import OrgAuthenticationMetadata from './OrgAuthenticationMetadata'
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
              ...OrgAuthenticationMetadata_saml
              id
            }
            ...OAuthProviderList_organization
          }
        }
      }
    `,
    queryRef
  )
  const {viewer} = data
  const {organization} = viewer
  const saml = organization?.saml ?? null
  const disabled = !saml
  return (
    <div className='space-y-6'>
      <StyledPanel>
        <DialogTitle className='px-6 pt-5 pb-6'>SAML Single Sign-On</DialogTitle>
        <OrgAuthenticationSSOFrame samlRef={saml} />
        <div className={disabled ? 'pointer-events-none select-none opacity-40' : ''}>
          <OrgAuthenticationSignOnUrl samlRef={saml} />
          <OrgAuthenticationMetadata samlRef={saml} />
        </div>
      </StyledPanel>

      <StyledPanel>
        <DialogTitle className='px-6 pt-5 pb-6'>OAuth 2.0 API</DialogTitle>
        <div className='px-6 pb-6'>
          <div className='mb-6 text-base text-slate-700'>
            Configure your organization as an OAuth 2.0 provider to allow external applications to
            authenticate with your Parabol organization.
          </div>
          {organization && <OAuthProviderList organizationRef={organization} />}
        </div>
      </StyledPanel>
    </div>
  )
}

export default OrgAuthentication
