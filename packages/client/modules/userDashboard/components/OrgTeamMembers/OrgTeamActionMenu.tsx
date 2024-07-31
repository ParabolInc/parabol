import {MenuItem} from '@mui/material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {OrgTeamActionMenu_team$key} from '../../../../__generated__/OrgTeamActionMenu_team.graphql'
import IconLabel from '../../../../components/IconLabel'
import LinkButton from '../../../../components/LinkButton'
import Menu from '../../../../components/Menu'
import {MenuProps} from '../../../../hooks/useMenu'
import useModal from '../../../../hooks/useModal'
import ArchiveTeamModal from '../OrgTeams/ArchiveTeamModal'

interface OrgTeamActionMenuProps {
  menuProps: MenuProps
  canDeleteTeam: boolean
  team: OrgTeamActionMenu_team$key
}

export const OrgTeamActionMenu = (props: OrgTeamActionMenuProps) => {
  const {menuProps, canDeleteTeam, team: teamRef} = props
  const team = useFragment(
    graphql`
      fragment OrgTeamActionMenu_team on Team {
        id
        name
        teamMembers(sortBy: "preferredName") {
          isLead
          preferredName
        }
      }
    `,
    teamRef
  )
  const {id: teamId, teamMembers, name: teamName} = team
  const teamLead = teamMembers.find((m) => m.isLead)
  const teamLeadName = teamLead?.preferredName ?? 'Nobody'
  const {togglePortal, modalPortal} = useModal()

  return (
    <Menu ariaLabel={'Select your action'} {...menuProps}>
      <MenuItem>
        {canDeleteTeam && (
          <LinkButton
            aria-label='Click to permanently delete this team.'
            palette='red'
            onClick={togglePortal}
          >
            <IconLabel icon='remove_circle' label='Delete Team' />
          </LinkButton>
        )}
        {modalPortal(
          <ArchiveTeamModal
            closeModal={togglePortal}
            teamId={teamId}
            teamName={teamName}
            teamLeadName={teamLeadName}
          />
        )}
      </MenuItem>
    </Menu>
  )
}
