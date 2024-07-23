import {DeleteOutline} from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'

import {OrgTeamsRow_team$key} from '../../../../__generated__/OrgTeamsRow_team.graphql'
import plural from '../../../../utils/plural'

type Props = {
  teamRef: OrgTeamsRow_team$key
  onArchiveTeam: (teamId: string) => void
}

const OrgTeamsRow = (props: Props) => {
  const {teamRef, onArchiveTeam} = props
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
    <div className='flex items-center p-4 hover:bg-slate-100'>
      <div className='flex flex-1 flex-col py-1'>
        <Link
          to={`teams/${teamId}`}
          className='text-gray-700 text-lg font-bold hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset'
        >
          {name}
        </Link>
        <div className='flex items-center justify-between'>
          <div className='text-gray-600'>
            {`${teamMembersCount} ${plural(teamMembersCount, 'member')}`}
          </div>
        </div>
      </div>
      <IconButton onClick={() => onArchiveTeam(teamId)} aria-label='Archive team'>
        <DeleteOutline />
      </IconButton>
    </div>
  )
}

export default OrgTeamsRow
