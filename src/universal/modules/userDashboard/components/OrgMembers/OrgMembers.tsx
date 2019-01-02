import React from 'react'
import {createPaginationContainer, graphql} from 'react-relay'
import OrgMemberRow from 'universal/modules/userDashboard/components/OrgUserRow/OrgMemberRow'
import Panel from 'universal/components/Panel/Panel'
import {BILLING_LEADER} from 'universal/utils/constants'
import {OrgMembers_viewer} from '__generated__/OrgMembers_viewer.graphql'

interface Props {
  viewer: OrgMembers_viewer
}

const OrgMembers = (props: Props) => {
  const {
    viewer: {organization}
  } = props
  if (!organization) return null
  const {organizationUsers} = organization
  const billingLeaderCount = organizationUsers.edges.reduce(
    (count, {node}) => (node.role === BILLING_LEADER ? count + 1 : count),
    0
  )
  return (
    <Panel label='Organization Members'>
      {organizationUsers.edges.map(({node: orgMember}) => {
        return (
          <OrgMemberRow
            key={orgMember.id}
            billingLeaderCount={billingLeaderCount}
            orgMember={orgMember}
            organization={organization}
          />
        )
      })}
    </Panel>
  )
}

export default createPaginationContainer<Props>(
  OrgMembers,
  graphql`
    fragment OrgMembers_viewer on User {
      organization(orgId: $orgId) {
        ...OrgMemberRow_organization
        organizationUsers(first: $first, after: $after)
          @connection(key: "OrgMembers_organizationUsers") {
          edges {
            cursor
            node {
              id
              role
              ...OrgMemberRow_orgMember
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `,
  {
    direction: 'forward',
    getConnectionFromProps (props) {
      const {viewer} = props
      return viewer && viewer.organization && viewer.organization.organizationUsers
    },
    getFragmentVariables (prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      }
    },
    getVariables (_props, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: count,
        after: cursor
      }
    },
    query: graphql`
      query OrgMembersPaginationQuery($first: Int!, $after: String, $orgId: ID!) {
        viewer {
          ...OrgMembers_viewer
        }
      }
    `
  }
)
