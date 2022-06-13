import graphql from 'babel-plugin-relay/macro'
import type {Parser as JSON2CSVParser} from 'json2csv'
import Parser from 'json2csv/lib/JSON2CSVParser' // only grab the sync parser
import React from 'react'
import {createPaginationContainer} from 'react-relay'
import ExportToCSVButton from '../../../../components/ExportToCSVButton'
import Panel from '../../../../components/Panel/Panel'
import {OrgMembers_viewer} from '../../../../__generated__/OrgMembers_viewer.graphql'
import OrgMemberRow from '../OrgUserRow/OrgMemberRow'

interface Props {
  viewer: OrgMembers_viewer
}

const OrgMembers = (props: Props) => {
  const {
    viewer: {organization}
  } = props
  if (!organization) return null
  const {organizationUsers, name: orgName} = organization
  const billingLeaderCount = organizationUsers.edges.reduce(
    (count, {node}) => (node.role === 'BILLING_LEADER' ? count + 1 : count),
    0
  )

  const exportToCSV = async () => {
    const rows = organizationUsers.edges.map((orgUser, idx) => {
      const {node} = orgUser
      return {
        Row: idx,
        Name: node.user.preferredName,
        Email: node.user.email,
        Inactive: node.inactive,
        'Billing Lead': node.role === 'BILLING_LEADER'
      }
    })
    const parser = new Parser({withBOM: true, eol: '\n'}) as JSON2CSVParser<any>
    const csv = parser.parse(rows)
    const date = new Date()
    const numDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    // copied from https://stackoverflow.com/questions/18848860/javascript-array-to-csv/18849208#18849208
    // note: using encodeUri does NOT work on the # symbol & breaks
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'})
    const encodedUri = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Parabol_${orgName}_${numDate}.csv`)
    document.body.appendChild(link) // Required for FF
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Panel
      label='Organization Members'
      controls={<ExportToCSVButton emailCSVUrl='/org/csv' handleClick={exportToCSV} />}
    >
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

export default createPaginationContainer<Props>(
  OrgMembers,
  {
    viewer: graphql`
      fragment OrgMembers_viewer on User {
        organization(orgId: $orgId) {
          ...OrgMemberRow_organization
          name
          organizationUsers(first: $first, after: $after)
            @connection(key: "OrgMembers_organizationUsers") {
            edges {
              cursor
              node {
                id
                inactive
                role
                user {
                  preferredName
                  email
                }
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
    `
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      const {viewer} = props
      return viewer && viewer.organization && viewer.organization.organizationUsers
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      }
    },
    getVariables(_props, {count, cursor}, fragmentVariables) {
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
