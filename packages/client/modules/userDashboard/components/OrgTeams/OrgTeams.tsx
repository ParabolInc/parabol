import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import Row from '../../../../components/Row/Row'
import Panel from '../../../../components/Panel/Panel'
import {Breakpoint, ElementWidth} from '../../../../types/constEnums'
import {useFragment} from 'react-relay'
import OrgTeamsRow from './OrgTeamsRow'
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
  organizationRef: any // OrgPage_organization$key
}

const OrgTeams = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgTeams_organization on Organization {
        id
        teams {
          ...OrgTeamsRow_team
        }
      }
    `,
    organizationRef
  )
  const {teams} = organization
  const teamsCount = teams.length
  return (
    <StyledPanel label={`${teamsCount} ${plural(teamsCount, 'team')}`}>
      <Row>
        <div className='flex w-full justify-between px-6'>
          <div className='flex items-center font-bold'>Team Name</div>
          <div className='flex items-center font-bold'>Lead</div>
        </div>
      </Row>
      {teams.map((team) => (
        <OrgTeamsRow key={team.id} teamRef={team} />
      ))}
    </StyledPanel>
  )
}

export default OrgTeams
