import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import type {Parser as JSON2CSVParser} from 'json2csv'
import Parser from 'json2csv/lib/JSON2CSVParser' // only grab the sync parser
import React from 'react'
import {PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import {OrgMembersPaginationQuery} from '~/__generated__/OrgMembersPaginationQuery.graphql'
import {OrgMembersQuery} from '~/__generated__/OrgMembersQuery.graphql'
import {OrgMembers_viewer$key} from '~/__generated__/OrgMembers_viewer.graphql'
import ExportToCSVButton from '../../../../components/ExportToCSVButton'
import Panel from '../../../../components/Panel/Panel'
import {ElementWidth} from '../../../../types/constEnums'
import {APP_CORS_OPTIONS} from '../../../../types/cors'
import OrgMemberRow from '../OrgUserRow/OrgMemberRow'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH
})

interface Props {
  queryRef: PreloadedQuery<OrgMembersQuery>
}

const OrgMembers = (props: Props) => {
  const {queryRef} = props
  const query = usePreloadedQuery<OrgMembersQuery>(
    graphql`
      query OrgMembersQuery($orgId: ID!, $first: Int!, $after: String) {
        ...OrgMembers_viewer
      }
    `,
    queryRef
  )
  const paginationRes = usePaginationFragment<OrgMembersPaginationQuery, OrgMembers_viewer$key>(
    graphql`
      fragment OrgMembers_viewer on Query @refetchable(queryName: "OrgMembersPaginationQuery") {
        viewer {
          organization(orgId: $orgId) {
            ...OrgMemberRow_organization
            name
            isBillingLeader
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
      }
    `,
    query
  )
  const {data} = paginationRes
  const {viewer} = data
  const {organization} = viewer
  if (!organization) return null
  const {organizationUsers, name: orgName, isBillingLeader} = organization
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
    <StyledPanel
      label='Organization Members'
      controls={
        isBillingLeader && (
          <ExportToCSVButton handleClick={exportToCSV} corsOptions={APP_CORS_OPTIONS} />
        )
      }
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
    </StyledPanel>
  )
}

export default OrgMembers
