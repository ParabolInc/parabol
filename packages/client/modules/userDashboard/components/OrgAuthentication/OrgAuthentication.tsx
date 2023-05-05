import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import Panel from '../../../../components/Panel/Panel'
import {OrgAuthenticationQuery} from '../../../../__generated__/OrgAuthenticationQuery.graphql'
import OrgAuthenticationHeader from './OrgAuthenticationHeader'
import OrgAuthenticationMetadata from './OrgAuthenticationMetadata'
import OrgAuthenticationSignOnUrl from './OrgAuthenticationSignOnUrl'
import OrgAuthenticationSSOFrame from './OrgAuthenticationSSOFrame'

interface Props {
  queryRef: PreloadedQuery<OrgAuthenticationQuery>
  orgId: string
  retry: () => void
}

const query = graphql`
  query OrgAuthenticationQuery($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        orgId: id
        isBillingLeader
        createdAt
        name

        featureFlags {
          SAMLUI
        }

        samlInfo {
          ...OrgAuthenticationSSOFrame_samlInfo
          ...OrgAuthenticationMetadata_samlInfo
          ...OrgAuthenticationSignOnUrl_samlInfo
        }
      }
    }
  }
`

const OrgAuthentication = (props: Props) => {
  const {queryRef, orgId, retry} = props
  const data = usePreloadedQuery<OrgAuthenticationQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })

  const {viewer} = data
  const {organization} = viewer
  const {samlInfo} = organization!

  const disabled = !organization?.isBillingLeader || !organization?.featureFlags.SAMLUI

  return (
    <Panel>
      <OrgAuthenticationHeader />
      <OrgAuthenticationSSOFrame disabled={disabled} samlInfo={samlInfo} />
      <OrgAuthenticationSignOnUrl disabled={disabled} samlInfo={samlInfo} />
      <OrgAuthenticationMetadata {...{orgId, samlInfo, disabled, retry}} />
    </Panel>
  )
}

export default OrgAuthentication
