import React from 'react'
import {Link} from 'react-router-dom'
import graphql from 'babel-plugin-relay/macro'
import Row from '../../../../components/Row/Row'
import {useFragment} from 'react-relay'
import plural from '../../../../utils/plural'

type Props = {
  teamRef: any // OrgPage_team$key
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
          isSelf
          email
        }
      }
    `,
    teamRef
  )
  const {id: teamId, teamMembers, name} = team
  const teamMembersCount = teamMembers.length
  const teamLeadEmail = teamMembers.find((member) => member.isLead).email
  const isViewerTeamLead = teamMembers.some((member) => member.isSelf && member.isLead)
  return (
    <Row>
      <div className='flex w-full flex-col px-6 py-1'>
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
            title='Email'
            className='text-gray-600 hover:underline'
          >
            {`${teamLeadEmail} ${isViewerTeamLead ? '(You)' : ''}`}
          </a>
        </div>
      </div>
    </Row>
  )
}

export default OrgTeamsRow
