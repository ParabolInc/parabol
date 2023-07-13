import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import Row from '../../../../components/Row/Row'
import Panel from '../../../../components/Panel/Panel'
import {Breakpoint, ElementWidth} from '../../../../types/constEnums'
import {useFragment} from 'react-relay'
import plural from '../../../../utils/plural'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH
})

const StyledRow = styled(Row)({
  padding: '12px 8px 12px 16px',
  [`@media screen and (min-width: ${Breakpoint.SIDEBAR_LEFT}px)`]: {
    padding: '16px 8px 16px 16px'
  }
})

type Props = {
  teamRef: any // OrgPage_team$key
}

const OrgTeamsRow = (props: Props) => {
  const {teamRef} = props
  const team = useFragment(
    graphql`
      fragment OrgTeamsRow_team on Team {
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
  console.log('🚀 ~ team:', team)
  const {teamMembers, name} = team
  const teamsCount = 2
  const teamMembersCount = teamMembers.length
  const teamLeadEmail = teamMembers.find((member) => member.isLead).email
  const isViewerTeamLead = teamMembers.some((member) => member.isSelf && member.isLead)
  console.log('🚀 ~ teamLeadEmail:', teamLeadEmail)
  // const teamMembersCount = teams.reduce((acc, team) => acc + team.teamMembers.length, 0)
  // const teamLeadEmail = teams.console.log('🚀 ~ organization:', {organization, teamMembersCount})
  return (
    <StyledRow>
      <div className='flex w-full flex-col px-6 py-2'>
        <div className='text-gray-700 text-lg font-bold'>{name}</div>
        <div className='flex items-center justify-between'>
          <a href='mailto' title='Send an email' className='text-gray-600 hover:underline'>
            {`${teamMembersCount}  ${plural(
              teamMembersCount,
              'member'
            )} • Last met on July 3rd 2023`}
          </a>
          <a
            href={`mailto:${teamLeadEmail}`}
            title='Email'
            className='text-gray-600 hover:underline'
          >
            {`${teamLeadEmail} ${isViewerTeamLead ? '(You)' : ''}`}
          </a>
        </div>
      </div>
    </StyledRow>
  )
}

export default OrgTeamsRow
