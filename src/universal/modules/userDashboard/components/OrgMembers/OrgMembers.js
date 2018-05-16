import PropTypes from 'prop-types'
import React from 'react'
import {createPaginationContainer} from 'react-relay'
import OrgMemberRow from 'universal/modules/userDashboard/components/OrgUserRow/OrgMemberRow'
import Panel from 'universal/components/Panel/Panel'

const OrgMembers = (props) => {
  const {
    viewer: {organization}
  } = props
  const {orgMembers} = organization
  const billingLeaderCount = orgMembers.edges.reduce(
    (count, {node}) => (node.isBillingLeader ? count + 1 : count),
    0
  )
  return (
    <Panel label='Organization Members'>
      {orgMembers.edges.map(({node: orgMember}) => {
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

OrgMembers.propTypes = {
  viewer: PropTypes.object.isRequired
}

export default createPaginationContainer(
  OrgMembers,
  graphql`
    fragment OrgMembers_viewer on User {
      organization(orgId: $orgId) {
        ...OrgMemberRow_organization
        orgMembers(first: $first, after: $after) @connection(key: "OrgMembers_orgMembers") {
          edges {
            cursor
            node {
              id
              isBillingLeader
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
      return props.viewer && props.viewer.orgMembers
    },
    getFragmentVariables (prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      }
    },
    getVariables (props, {count, cursor}, fragmentVariables) {
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
