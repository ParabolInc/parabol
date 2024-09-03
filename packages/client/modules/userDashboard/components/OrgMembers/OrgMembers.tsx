import graphql from 'babel-plugin-relay/macro'
import type {Parser as JSON2CSVParser} from 'json2csv'
import Parser from 'json2csv/lib/JSON2CSVParser' // only grab the sync parser
import React, {useMemo, useState} from 'react'
import {PreloadedQuery, usePaginationFragment, usePreloadedQuery} from 'react-relay'
import {OrgMembersPaginationQuery} from '~/__generated__/OrgMembersPaginationQuery.graphql'
import {OrgMembersQuery} from '~/__generated__/OrgMembersQuery.graphql'
import {OrgMembers_viewer$key} from '~/__generated__/OrgMembers_viewer.graphql'
import User from '../../../../../server/database/types/User'
import ExportToCSVButton from '../../../../components/ExportToCSVButton'
import {APP_CORS_OPTIONS} from '../../../../types/cors'
import OrgMemberRow from '../OrgUserRow/OrgMemberRow'

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
                    lastSeenAt
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
    (count, {node}) =>
      ['BILLING_LEADER', 'ORG_ADMIN'].includes(node.role ?? '') ? count + 1 : count,
    0
  )
  const orgAdminCount = organizationUsers.edges.reduce(
    (count, {node}) => (['ORG_ADMIN'].includes(node.role ?? '') ? count + 1 : count),
    0
  )
  const [sortBy, setSortBy] = useState<keyof User>('lastSeenAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const sortedOrganizationUsers = useMemo(() => {
    return [...organizationUsers.edges].sort((a, b) => {
      if (sortBy === 'lastSeenAt') {
        const aDate = a.node.user.lastSeenAt ? new Date(a.node.user.lastSeenAt) : new Date(0)
        const bDate = b.node.user.lastSeenAt ? new Date(b.node.user.lastSeenAt) : new Date(0)
        return sortDirection === 'asc'
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime()
      } else if (sortBy === 'preferredName') {
        return sortDirection === 'asc'
          ? a.node.user.preferredName.localeCompare(b.node.user.preferredName)
          : b.node.user.preferredName.localeCompare(a.node.user.preferredName)
      }
      return 0
    })
  }, [organizationUsers.edges, sortBy, sortDirection])

  const handleSort = (column: keyof User) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

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
    <div className='max-w-4xl pb-4'>
      <div className='flex items-center justify-start py-1'>
        <div>
          <h1 className='text-2xl font-semibold leading-7'>Members</h1>
        </div>
        <div className='ml-auto'>
          {isBillingLeader && (
            <ExportToCSVButton handleClick={exportToCSV} corsOptions={APP_CORS_OPTIONS} />
          )}
        </div>
      </div>

      <div className='divide-y divide-slate-300 overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm'>
        <div className='bg-slate-100 px-4 py-2'>
          <div className='flex w-full justify-between'>
            <div className='flex items-center font-bold'>
              {organizationUsers.edges.length} total
            </div>
          </div>
        </div>
        <div className='w-full overflow-x-auto px-4'>
          <table className='w-full table-fixed border-collapse md:table-auto'>
            <thead>
              <tr className='border-b border-slate-300'>
                <th
                  className='w-[70%] cursor-pointer p-3 text-left font-semibold'
                  onClick={() => handleSort('preferredName')}
                >
                  User
                  {sortBy === 'preferredName' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th
                  className='w-[20%] cursor-pointer p-3 text-left font-semibold'
                  onClick={() => handleSort('lastSeenAt')}
                >
                  Last Seen
                  {sortBy === 'lastSeenAt' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </th>
                <th className='w-[20%] p-3 text-left font-semibold'></th>
              </tr>
            </thead>
            <tbody>
              {sortedOrganizationUsers.map(({node: organizationUser}) => (
                <OrgMemberRow
                  key={organizationUser.id}
                  billingLeaderCount={billingLeaderCount}
                  orgAdminCount={orgAdminCount}
                  organizationUser={organizationUser}
                  organization={organization}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default OrgMembers
