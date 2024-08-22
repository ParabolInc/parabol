import styled from '@emotion/styled'
import React from 'react'
import User from '../../../../../server/database/types/User'
import {Breakpoint} from '../../../../types/constEnums'
import OrgMemberRow from '../OrgUserRow/OrgMemberRow'

const TableWrapper = styled('div')({
  overflowX: 'auto',
  width: '100%',
  padding: '0 16px'
})

const StyledTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  tableLayout: 'fixed',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    tableLayout: 'fixed'
  }
})

const TableHeader = styled('th')<{width: string}>(({width}) => ({
  padding: '12px 8px',
  textAlign: 'left',
  fontWeight: 600,
  borderBottom: '1px solid #e0e0e0',
  width: width
}))

interface Props {
  organization: any // Replace with the correct type
  organizationUsers: any[] // Replace with the correct type
  billingLeaderCount: number
  orgAdminCount: number
  onSort: (column: keyof User) => void
  sortBy: keyof User
  sortDirection: 'asc' | 'desc'
}

const OrgMemberTable: React.FC<Props> = ({
  organization,
  organizationUsers,
  billingLeaderCount,
  orgAdminCount,
  onSort,
  sortBy,
  sortDirection
}) => {
  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <tr>
            <TableHeader width='70%' onClick={() => onSort('email')} style={{cursor: 'pointer'}}>
              User
              {sortBy === 'email' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </TableHeader>
            <TableHeader
              width='20%'
              onClick={() => onSort('lastSeenAt')}
              style={{cursor: 'pointer'}}
            >
              Last Seen Date
              {sortBy === 'lastSeenAt' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </TableHeader>
            <TableHeader width='20%'></TableHeader>
          </tr>
        </thead>
        <tbody>
          {organizationUsers.map((orgUser: any) => (
            <OrgMemberRow
              key={orgUser.user.userId}
              organizationUser={orgUser}
              organization={organization}
              billingLeaderCount={billingLeaderCount}
              orgAdminCount={orgAdminCount}
            />
          ))}
        </tbody>
      </StyledTable>
    </TableWrapper>
  )
}

export default OrgMemberTable
