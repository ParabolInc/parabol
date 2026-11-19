import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {OrgAIAppsQuery} from '../../../../__generated__/OrgAIAppsQuery.graphql'
import OrgAIAppConnections from './OrgAIAppConnections'
import OrgAIAppsPolicyPanel from './OrgAIAppsPolicyPanel'

interface Props {
  queryRef: PreloadedQuery<OrgAIAppsQuery>
}

const OrgAIApps = ({queryRef}: Props) => {
  const data = usePreloadedQuery<OrgAIAppsQuery>(
    graphql`
      query OrgAIAppsQuery($orgId: ID!) {
        viewer {
          organization(orgId: $orgId) {
            ...OrgAIAppsPolicyPanel_organization
            ...OrgAIAppConnections_organization
          }
        }
      }
    `,
    queryRef
  )
  const {organization} = data.viewer
  if (!organization) return null
  return (
    <>
      <OrgAIAppsPolicyPanel organizationRef={organization} />
      <OrgAIAppConnections organizationRef={organization} />
    </>
  )
}

export default OrgAIApps
