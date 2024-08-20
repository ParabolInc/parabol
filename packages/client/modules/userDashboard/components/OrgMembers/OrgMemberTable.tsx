import styled from '@emotion/styled'
import React from 'react'
import {Breakpoint} from '../../../../types/constEnums'
import OrgMemberRow from '../OrgUserRow/OrgMemberRow'

const TableWrapper = styled('div')({
  overflowX: 'auto',
  width: '100%'
})

const StyledTable = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    tableLayout: 'fixed'
  }
})

const TableHeader = styled('th')({
  padding: '12px 8px',
  textAlign: 'left',
  fontWeight: 600,
  borderBottom: '1px solid #e0e0e0'
})

interface Props {
  organization: any // Replace with the correct type
  organizationUsers: any[] // Replace with the correct type
  billingLeaderCount: number
  orgAdminCount: number
}

const OrgMemberTable: React.FC<Props> = ({
  organization,
  organizationUsers,
  billingLeaderCount,
  orgAdminCount
}) => {
  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <tr>
            <TableHeader>Avatar</TableHeader>
            <TableHeader>Name</TableHeader>
            <TableHeader>Last Active Date</TableHeader>
            <TableHeader>Actions</TableHeader>
          </tr>
        </thead>
        <tbody>
          {organizationUsers.map((orgUser) => (
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
