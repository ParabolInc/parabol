import {ChevronRight} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'

import {OrgTeamsRow_team$key} from '../../../../__generated__/OrgTeamsRow_team.graphql'
import plural from '../../../../utils/plural'

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
          preferredName
        }
      }
    `,
    teamRef
  )
  const {id: teamId, teamMembers, name} = team
  const teamMembersCount = teamMembers.length
  const viewerTeamMember = teamMembers.find((m) => m.isSelf)
  const isLead = viewerTeamMember?.isLead
  const isMember = !!viewerTeamMember && !isLead

  return (
    <Link
      className='block hover:bg-slate-100 focus-visible:ring-1 focus-visible:outline-hidden focus-visible:ring-inset'
      to={`teams/${teamId}`}
    >
      <div className='flex items-center p-4'>
        <div className='flex flex-1 flex-col py-1'>
          <div className='text-gray-700 flex items-center text-lg font-bold'>
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
          <div className='flex items-center justify-between'>
            <div className='text-gray-600'>
              {`${teamMembersCount} ${plural(teamMembersCount, 'member')}`}
            </div>
          </div>
        </div>
        <div className='flex items-center justify-center'>
          <ChevronRight />
        </div>
      </div>
    </Link>
  )
}

export default OrgTeamsRow
