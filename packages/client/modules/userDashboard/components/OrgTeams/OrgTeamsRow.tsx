import graphql from 'babel-plugin-relay/macro'
import {format} from 'date-fns'
import type {ReactNode} from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router'
import {ChevronRight} from '~/ui/icons'
import plural from '~/utils/plural'
import type {OrgTeamsRow_team$key} from '../../../../__generated__/OrgTeamsRow_team.graphql'

type Props = {
  teamRef: OrgTeamsRow_team$key
  isOrgAdmin?: boolean
  // a cell for each org structure level
  children?: ReactNode
}

const OrgTeamsRow = (props: Props) => {
  const {teamRef, isOrgAdmin, children} = props
  const team = useFragment(
    graphql`
      fragment OrgTeamsRow_team on Team {
        id
        name
        teamMembersCount
        teamMembers {
          isSelf
          isLead
        }
        lastMetAt
      }
    `,
    teamRef
  )
  const {id: teamId, teamMembers, teamMembersCount, name, lastMetAt} = team
  const viewerTeamMember = teamMembers.find((m) => m.isSelf)
  const isLead = viewerTeamMember?.isLead
  const isMember = !!viewerTeamMember && !isLead
  const lastMetDate = lastMetAt ? format(new Date(lastMetAt), 'yyyy-MM-dd') : null

  const teamNameAndTags = (
    <div className='flex flex-1 flex-wrap items-center gap-x-2 gap-y-1 md:flex-nowrap'>
      <span className='wrap-anywhere md:wrap-normal'>{name}</span>
      {isLead && (
        <span className='rounded-full bg-primary px-2 py-0.5 text-white text-xs dark:bg-grape-600'>
          Team Lead
        </span>
      )}
      {isMember && (
        <span className='rounded-full bg-sky-500 px-2 py-0.5 text-white text-xs'>Member</span>
      )}
      <span className='basis-full font-normal text-fg-secondary text-sm md:hidden'>
        {teamMembersCount} {plural(teamMembersCount, 'member')} ·{' '}
        <span className='whitespace-nowrap'>
          {lastMetDate ? `Last met ${lastMetDate}` : 'Never met'}
        </span>
      </span>
    </div>
  )
  return (
    <tr className='border-hairline border-b hover:bg-surface-hover'>
      <td className='p-3'>
        <div className='flex items-center py-3 md:px-3'>
          {isLead || isMember || isOrgAdmin ? (
            <Link
              to={teamId}
              className='flex flex-1 items-center font-bold text-fg-primary text-lg md:flex-initial'
            >
              {teamNameAndTags}
              <ChevronRight className='ml-2 text-fg-secondary' />
            </Link>
          ) : (
            <div className='flex items-center font-bold text-fg-primary text-lg'>
              {teamNameAndTags}
            </div>
          )}
        </div>
      </td>
      <td className='hidden p-3 text-fg-secondary md:table-cell'>{teamMembersCount}</td>
      <td className='hidden p-3 text-fg-secondary md:table-cell'>{lastMetDate ?? 'Never'}</td>
      {children}
    </tr>
  )
}

export default OrgTeamsRow
