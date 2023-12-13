import React from 'react'
import {Link} from 'react-router-dom'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import plural from '../../../../utils/plural'
import {OrgTeamsRow_team$key} from '../../../../__generated__/OrgTeamsRow_team.graphql'

type Props = {
  teamRef: OrgTeamsRow_team$key
}

const OrgTeamsRow = (props: Props) => {
  const {teamRef} = props
  const team = useFragment(
    graphql`
      fragment OrgTeamsRow_team on Team {
        id
        name
        teamMembers {
          id
          isLead
          isOrgAdmin
          isSelf
          email
        }
      }
    `,
    teamRef
  )
  const {id: teamId, teamMembers, name} = team
  const teamMembersCount = teamMembers.length

  return (
    <Link
      className='block hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset'
      to={`teams/${teamId}`}
    >
      <div className='flex items-center p-4'>
        <div className='flex flex-1 flex-col px-4 py-1'>
          <div className='text-gray-700 text-lg font-bold'>{name}</div>
          <div className='flex items-center justify-between'>
            <div className='text-gray-600'>
              {`${teamMembersCount} ${plural(teamMembersCount, 'member')}`}
            </div>
          </div>
        </div>
        <div></div>
      </div>
    </Link>
  )
}

export default OrgTeamsRow
