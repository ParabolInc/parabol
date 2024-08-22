import React from 'react'
import User from '../../../../../server/database/types/User'
import OrgMemberRow from '../OrgUserRow/OrgMemberRow'

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
    <div className='w-full overflow-x-auto px-4'>
      <table className='w-full table-fixed border-collapse md:table-auto'>
        <thead>
          <tr className='border-b border-slate-300'>
            <th
              className='w-[70%] cursor-pointer p-3 text-left font-semibold'
              onClick={() => onSort('email')}
            >
              User
              {sortBy === 'email' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </th>
            <th
              className='w-[20%] cursor-pointer p-3 text-left font-semibold'
              onClick={() => onSort('lastSeenAt')}
            >
              Last Seen Date
              {sortBy === 'lastSeenAt' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </th>
            <th className='w-[20%] p-3 text-left font-semibold'></th>
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
      </table>
    </div>
  )
}

export default OrgMemberTable
