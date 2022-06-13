import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import Panel from '../../../../components/Panel/Panel'
import {OrgMembersPaginationQuery} from '../../../../__generated__/OrgMembersPaginationQuery.graphql'
import {OrgMembersQuery} from '../../../../__generated__/OrgMembersQuery.graphql'
import {OrgMembers_query$key} from '../../../../__generated__/OrgMembers_query.graphql'
import OrgMemberRow from '../OrgUserRow/OrgMemberRow'

interface Props {
  queryRef: PreloadedQuery<OrgMembersQuery>
}

const OrgMembers = ({queryRef}: Props) => {
  const query = usePreloadedQuery<OrgMembersQuery>(
    graphql`
      query OrgMembersQuery($orgId: ID!, $first: Int!, $after: String) {
        ...OrgMembers_query
      }
    `,
    queryRef,
    {
      UNSTABLE_renderPolicy: 'full'
    }
  )

  const {data} = usePaginationFragment<OrgMembersPaginationQuery, OrgMembers_query$key>(
    graphql`
      fragment OrgMembers_query on Query @refetchable(queryName: "OrgMembersPaginationQuery") {
        viewer {
          organization(orgId: $orgId) {
            ...OrgMemberRow_organization
            organizationUsers(first: $first, after: $after)
              @connection(key: "OrgMembers_organizationUsers") {
              edges {
                cursor
                node {
                  id
                  role
                  ...OrgMemberRow_organizationUser
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      }
    `,
    query
  )
  const {viewer} = data
  const {organization} = viewer
  if (!organization) return null
  const {organizationUsers} = organization
  const billingLeaderCount = organizationUsers.edges.reduce(
    (count, {node}) => (node.role === 'BILLING_LEADER' ? count + 1 : count),
    0
  )
  return (
    <Panel label='Organization Members'>
      {organizationUsers.edges.map(({node: organizationUser}) => {
        return (
          <OrgMemberRow
            key={organizationUser.id}
            billingLeaderCount={billingLeaderCount}
            organizationUser={organizationUser}
            organization={organization}
          />
        )
      })}
    </Panel>
  )
}

export default OrgMembers
