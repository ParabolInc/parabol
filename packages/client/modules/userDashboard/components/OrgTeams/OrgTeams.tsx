import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import styled from '@emotion/styled'
import Row from '../../../../components/Row/Row'
import Panel from '../../../../components/Panel/Panel'
import {ElementWidth} from '../../../../types/constEnums'
import {useFragment} from 'react-relay'
import OrgTeamsRow from './OrgTeamsRow'
import {OrgTeams_organization$key} from '../../../../__generated__/OrgTeams_organization.graphql'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH
})

type Props = {
  organizationRef: OrgTeams_organization$key
}

const OrgTeams = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgTeams_organization on Organization {
        id
        isBillingLeader
        allTeams {
          id
          ...OrgTeamsRow_team
        }
      }
    `,
    organizationRef
  )
  const {allTeams, isBillingLeader} = organization
  if (!isBillingLeader) return null
  return (
    <>
      <h1>{'Teams'}</h1>
      <StyledPanel>
        <Row>
          <div className='flex w-full justify-between px-4'>
            <div className='flex items-center font-bold'>Team Name</div>
            <div className='flex items-center font-bold'>Lead</div>
          </div>
        </Row>
        {allTeams.map((team) => (
          <OrgTeamsRow key={team.id} teamRef={team} />
        ))}
      </StyledPanel>
    </>
  )
}

export default OrgTeams
