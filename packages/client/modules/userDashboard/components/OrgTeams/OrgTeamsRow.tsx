import {ChevronRight} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {format} from 'date-fns'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import type {OrgTeamsRow_team$key} from '../../../../__generated__/OrgTeamsRow_team.graphql'

type Props = {
  teamRef: OrgTeamsRow_team$key
  isOrgAdmin?: boolean
}

const OrgTeamsRow = (props: Props) => {
  const {teamRef, isOrgAdmin} = props
  const team = useFragment(
    graphql`
      fragment OrgTeamsRow_team on Team {
        id
        name
        teamMembers {
          isSelf
          isLead
        }
        lastMetAt
      }
    `,
    teamRef
  )
  const {id: teamId, teamMembers, name, lastMetAt} = team
  const teamMembersCount = teamMembers.length
  const viewerTeamMember = teamMembers.find((m) => m.isSelf)
  const isLead = viewerTeamMember?.isLead
  const isMember = !!viewerTeamMember && !isLead

  const teamNameAndTags = (
    <div className='flex flex-1 items-center'>
      {name}
      {isLead && (
        <span className='ml-2 rounded-full bg-primary px-2 py-0.5 text-white text-xs'>
          Team Lead
        </span>
      )}
      {isMember && (
        <span className='ml-2 rounded-full bg-sky-500 px-2 py-0.5 text-white text-xs'>Member</span>
      )}
    </div>
  )
  return (
    <tr className='border-hairline border-b hover:bg-surface-hover'>
      <td className='flex items-center p-3'>
        <td className='flex items-center p-3'>
          {isLead || isMember || isOrgAdmin ? (
            <Link to={teamId} className='flex items-center font-bold text-fg-primary text-lg'>
              {teamNameAndTags}
              <ChevronRight className='ml-2 text-fg-secondary' />
            </Link>
          ) : (
            <div className='flex items-center font-bold text-fg-primary text-lg'>
              {teamNameAndTags}
            </div>
          )}
        </td>
      </td>
      <td className='p-3 text-fg-secondary'>{teamMembersCount}</td>
      <td className='p-3 text-fg-secondary'>
        {lastMetAt ? format(new Date(lastMetAt), 'yyyy-MM-dd') : 'Never'}
      </td>
    </tr>
  )
}

export default OrgTeamsRow
