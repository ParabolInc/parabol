import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {OrgAuthenticationQuery} from '../../../../__generated__/OrgAuthenticationQuery.graphql'
import Panel from '../../../../components/Panel/Panel'
import OrgAuthenticationHeader from './OrgAuthenticationHeader'
import OrgAuthenticationMetadata from './OrgAuthenticationMetadata'
import OrgAuthenticationSSOFrame from './OrgAuthenticationSSOFrame'
import OrgAuthenticationSignOnUrl from './OrgAuthenticationSignOnUrl'

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
          }
        }
      }
    `,
    queryRef
  )
  const {viewer} = data
  const {organization} = viewer
  const saml = organization?.saml ?? null
  const disabled = !!saml
  return (
    <Panel>
      <OrgAuthenticationHeader />
      <OrgAuthenticationSSOFrame samlRef={saml} />
      <div className={disabled ? 'pointer-events-none select-none opacity-40' : ''}>
        <OrgAuthenticationSignOnUrl samlRef={saml} />
        <OrgAuthenticationMetadata samlRef={saml} />
      </div>
    </Panel>
  )
}

export default OrgAuthentication
