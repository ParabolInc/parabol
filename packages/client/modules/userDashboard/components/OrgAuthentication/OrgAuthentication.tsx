import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import Panel from '../../../../components/Panel/Panel'
import {OrgAuthenticationQuery} from '../../../../__generated__/OrgAuthenticationQuery.graphql'
import OrgAuthenticationHeader from './OrgAuthenticationHeader'
import OrgAuthenticationMetadata from './OrgAuthenticationMetadata'
import OrgAuthenticationSignOnUrl from './OrgAuthenticationSignOnUrl'
import OrgAuthenticationSSOEnabled from './OrgAuthenticationSSOFrame'

interface Props {
  queryRef: PreloadedQuery<OrgAuthenticationQuery>
  orgId: string
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
          id
          domains
          url
          metadata
        }
      }
    }
  }
`

const OrgAuthentication = (props: Props) => {
  const {queryRef, orgId} = props
  const data = usePreloadedQuery<OrgAuthenticationQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })

  const {viewer} = data
  const {organization} = viewer

  const disabled =
    !organization?.isBillingLeader ||
    !organization?.featureFlags?.SAMLUI ||
    !organization?.samlInfo?.domains?.length

  return (
    <Panel>
      <OrgAuthenticationHeader />
      <OrgAuthenticationSSOEnabled disabled={disabled} samlInfo={organization?.samlInfo} />
      <OrgAuthenticationSignOnUrl
        singleSignOnUrl={organization?.samlInfo?.url}
        disabled={disabled}
      />
      <OrgAuthenticationMetadata orgId={orgId} disabled={disabled} />
    </Panel>
  )
}

export default OrgAuthentication
