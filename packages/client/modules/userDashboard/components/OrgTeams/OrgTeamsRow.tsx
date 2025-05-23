import {ChevronRight} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {format} from 'date-fns'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
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

  return (
    <tr className='hover:bg-slate-50 border-b border-slate-300'>
      <td className='p-3'>
        <Link
          to={`teams/${teamId}`}
          className='text-gray-700 hover:text-gray-900 flex items-center text-lg font-bold'
        >
          <div className='flex flex-1 items-center'>
            {name}
            {isLead && (
              <span className='ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white'>
                Team Lead
              </span>
            )}
            {isMember && (
              <span className='ml-2 rounded-full bg-sky-500 px-2 py-0.5 text-xs text-white'>
                Member
              </span>
            )}
          </div>
          <ChevronRight className='ml-2 text-slate-600' />
        </Link>
      </td>
      <td className='text-gray-600 p-3'>{teamMembersCount}</td>
      <td className='text-gray-600 p-3'>
        {lastMetAt ? format(new Date(lastMetAt), 'yyyy-MM-dd') : 'Never'}
      </td>
    </tr>
  )
}

export default OrgTeamsRow
