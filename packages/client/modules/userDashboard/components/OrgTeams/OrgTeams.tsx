import React, {useMemo, useState} from 'react'
import graphql from 'babel-plugin-relay/macro'
import useMenu from '../../../../hooks/useMenu'
import styled from '@emotion/styled'
import Row from '../../../../components/Row/Row'
import Panel from '../../../../components/Panel/Panel'
import {ElementWidth} from '../../../../types/constEnums'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import OrgTeamsRow from './OrgTeamsRow'
import Menu from '../../../../components/Menu'
import {MenuPosition} from '../../../../hooks/useCoords'
import MenuItem from '../../../../components/MenuItem'
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
            id
            activeDomain
            isBillingLeader
            name
            teams {
              id
              ...OrgTeamsRow_team
            }
          }
          domains {
            id
            organizations {
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
  const {viewer} = data
  const {featureFlags, domains, organization} = viewer
  const {activeDomain, teams, isBillingLeader, name} = organization ?? {}
  const {canViewTeamsInDomain} = featureFlags
  const ALL_TEAMS_IN_ORG = `All Teams In ${name}`
  const ALL_TEAMS_IN_DOMAIN = `All Teams In ${activeDomain}`
  const [isDomainSelected, setIsDomainSelected] = useState(canViewTeamsInDomain)

  const teamsByDomain = useMemo(() => {
    return domains.flatMap((domain) =>
      domain.organizations.flatMap((organization) => organization.teams)
    )
  }, [domains])

  const handleMenuItemClick = (isDomain: boolean) => {
    setIsDomainSelected(isDomain)
    togglePortal()
  }

  const selectedTeams = (isDomainSelected && canViewTeamsInDomain ? teamsByDomain : teams) ?? []
  const label = isDomainSelected ? ALL_TEAMS_IN_DOMAIN : ALL_TEAMS_IN_ORG

  if (!isBillingLeader) return null
  return (
    <>
      <h1>{'Teams'}</h1>
      {canViewTeamsInDomain && (
        <>
          <DashFilterToggle onClick={togglePortal} label={label} ref={originRef} value={label} />
          {menuPortal(
            <Menu
              keepParentFocus
              defaultActiveIdx={isDomainSelected ? 0 : 1}
              ariaLabel={'Select whether to filter by org or domain'}
              {...menuProps}
            >
              <MenuItem label={ALL_TEAMS_IN_DOMAIN} onClick={() => handleMenuItemClick(true)} />
              <MenuItem label={ALL_TEAMS_IN_ORG} onClick={() => handleMenuItemClick(false)} />
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
