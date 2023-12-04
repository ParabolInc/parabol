import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import {ElementWidth} from '../../../../types/constEnums'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {OrgAuthenticationQuery} from '../../../../__generated__/OrgAuthenticationQuery.graphql'
import DialogTitle from '../../../../components/DialogTitle'
import Panel from '../../../../components/Panel/Panel'
import OrgAuthenticationMetadata from './OrgAuthenticationMetadata'
import OrgAuthenticationSSOFrame from './OrgAuthenticationSSOFrame'
import OrgAuthenticationSignOnUrl from './OrgAuthenticationSignOnUrl'

const StyledPanel = styled(Panel)<{isWide: boolean}>(({isWide}) => ({
  maxWidth: isWide ? ElementWidth.PANEL_WIDTH : 'inherit'
}))

interface Props {
  queryRef: PreloadedQuery<OrgAuthenticationQuery>
}
const OrgAuthentication = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<OrgAuthenticationQuery>(
    graphql`
      query OrgAuthenticationQuery($orgId: ID!) {
        viewer {
          featureFlags {
            checkoutFlow
          }
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
  const {organization, featureFlags} = viewer
  const {checkoutFlow} = featureFlags
  const saml = organization?.saml ?? null
  const disabled = !saml
  return (
    <StyledPanel isWide={checkoutFlow}>
      <DialogTitle className='px-6 pt-5 pb-6'>SAML Single Sign-On</DialogTitle>
      <OrgAuthenticationSSOFrame samlRef={saml} />
      <div className={disabled ? 'pointer-events-none select-none opacity-40' : ''}>
        <OrgAuthenticationSignOnUrl samlRef={saml} />
        <OrgAuthenticationMetadata samlRef={saml} />
      </div>
    </StyledPanel>
  )
}

export default OrgAuthentication
