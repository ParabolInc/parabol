import React, {useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import useMenu, {MenuProps} from '../../../../hooks/useMenu'
import styled from '@emotion/styled'
import Row from '../../../../components/Row/Row'
import Panel from '../../../../components/Panel/Panel'
import {ElementWidth, FilterLabels} from '../../../../types/constEnums'
import {PreloadedQuery, useFragment, usePreloadedQuery} from 'react-relay'
import OrgTeamsRow from './OrgTeamsRow'
import SwitchLabels from '../../../../components/Switch/Switch'
import {OrgTeams_organization$key} from '../../../../__generated__/OrgTeams_organization.graphql'
import Menu from '../../../../components/Menu'
import {MenuPosition} from '../../../../hooks/useCoords'
import MenuItem from '../../../../components/MenuItem'
import DropdownMenuLabel from '../../../../components/DropdownMenuLabel'
import DashFilterToggle from '../../../../components/DashFilterToggle/DashFilterToggle'
import {OrgTeamsQuery} from '../../../../__generated__/OrgTeamsQuery.graphql'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH
})

type Props = {
  queryRef: PreloadedQuery<OrgTeamsQuery>
}

const OrgTeams = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<OrgTeamsQuery>(
    graphql`
      query OrgTeamsQuery($orgId: ID!) {
        viewer {
          featureFlags {
            canViewTeamsInDomain
          }
          organization(orgId: $orgId) {
            teams {
              id
              ...OrgTeamsRow_team
            }
          }
          domains {
            organizations {
              id
              isBillingLeader
              teams {
                id
                ...OrgTeamsRow_team
              }
            }
          }
        }
      }
    `,
    queryRef
  )

  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const [label, setLabel] = useState(FilterLabels.ALL_TEAMS_IN_ORG)
  const {viewer} = data
  const {featureFlags, domains, organization} = viewer
  const teamsByDomain = domains.flatMap((domain) =>
    domain.organizations.flatMap((organization) => organization.teams)
  )
  const {canViewTeamsInDomain} = featureFlags

  const handleMenuItemClick = (
    newLabel: FilterLabels.ALL_TEAMS_IN_ORG | FilterLabels.ALL_TEAMS_IN_DOMAIN
  ) => {
    setLabel(newLabel)
    togglePortal()
  }

  const {teams, isBillingLeader} = organization
  const selectedTeams = label === FilterLabels.ALL_TEAMS_IN_ORG ? teams : teamsByDomain
  if (!isBillingLeader) return null
  return (
    <>
      <h1>{'Teams'}</h1>
      {canViewTeamsInDomain && (
        <>
          <DashFilterToggle
            onClick={togglePortal}
            // onMouseEnter={TeamDashTeamMemberMenu.preload}
            ref={originRef}
            value={label}
          />
          {menuPortal(
            <Menu
              keepParentFocus
              defaultActiveIdx={label === FilterLabels.ALL_TEAMS_IN_ORG ? 0 : 1}
              ariaLabel={'Select the team to filter by'}
              {...menuProps}
            >
              <MenuItem
                label={'All Teams In Org'}
                onClick={() => handleMenuItemClick(FilterLabels.ALL_TEAMS_IN_ORG)}
              />
              <MenuItem
                label={'All Teams In Domain'}
                onClick={() => handleMenuItemClick(FilterLabels.ALL_TEAMS_IN_DOMAIN)}
              />
            </Menu>
          )}
        </>
      )}
      <StyledPanel>
        <Row>
          <div className='flex w-full justify-between px-4'>
            <div className='flex items-center font-bold'>Team Name</div>
            <div className='flex items-center font-bold'>Lead</div>
          </div>
        </Row>
        {selectedTeams.map((team) => (
          <OrgTeamsRow key={team.id} teamRef={team} />
        ))}
      </StyledPanel>
    </>
  )
}

export default OrgTeams
