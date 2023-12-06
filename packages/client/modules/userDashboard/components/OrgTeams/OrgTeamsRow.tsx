import React from 'react'
import {Link} from 'react-router-dom'
import graphql from 'babel-plugin-relay/macro'
import Row from '../../../../components/Row/Row'
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
  const teamLeadEmail = teamMembers.find((member) => member.isLead)?.email ?? ''
  const isViewerTeamLead = teamMembers.some(
    (member) => member.isSelf && (member.isLead || member.isOrgAdmin)
  )
  return (
    <Row>
      <div className='flex w-full flex-col px-4 py-1'>
        <div className='text-gray-700 text-lg font-bold'>{name}</div>
        <div className='flex items-center justify-between'>
          <div className='text-gray-600'>
            {`${teamMembersCount} ${plural(teamMembersCount, 'member')}`}
            {isViewerTeamLead && (
              <>
                <span className='mx-2'>•</span>
                <Link
                  to={`/team/${teamId}/settings`}
                  className='cursor-pointer font-bold text-sky-500 hover:underline'
                >
                  {'Manage Team'}
                </Link>
              </>
            )}
          </div>

          <a
            href={`mailto:${teamLeadEmail}`}
            target='_blank'
            title='Email'
            className='text-gray-600 hover:underline'
            rel='noreferrer'
          >
            {`${teamLeadEmail} ${isViewerTeamLead ? '(You)' : ''}`}
          </a>
        </div>
      </div>
    </Row>
  )
}

export default OrgTeamsRow
