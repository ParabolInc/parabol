import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {ArrowBack} from '@mui/icons-material'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {OrgTeamMembersQuery} from '../../../../__generated__/OrgTeamMembersQuery.graphql'
import {OrgTeamMembersRow} from './OrgTeamMembersRow'
import {Button} from '../../../../ui/Button/Button'
import {Link} from 'react-router-dom'
import {ORGANIZATIONS} from '../../../../utils/constants'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {OrgTeamMembersMenu} from './OrgTeamMembersMenu'
import {useDialogState} from '../../../../ui/Dialog/useDialogState'
import DeleteTeamDialogRoot from '../../../../components/DeleteTeamDialogRoot'

interface Props {
  queryRef: PreloadedQuery<OrgTeamMembersQuery>
}

const query = graphql`
  query OrgTeamMembersQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        ...ArchiveTeam_team
        id
        billingTier
        isOrgAdmin
        isViewerLead
        name
        orgId
        teamMembers(sortBy: "preferredName") {
          id
          isNotRemoved
          ...AddTeamMemberModal_teamMembers
          ...OrgTeamMembersRow_teamMember
        }
        tier
      }
    }
  }
`

export const OrgTeamMembers = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<OrgTeamMembersQuery>(query, queryRef)
  const {viewer} = data
  const {team} = viewer
  const {menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

  const {
    open: openDeleteTeamDialog,
    close: closeDeleteTeamDialog,
    isOpen: isDeleteTeamDialogOpened
  } = useDialogState()

  if (!team) return null
  const {isViewerLead, isOrgAdmin: isViewerOrgAdmin, teamMembers} = team

  return (
    <div className='max-w-4xl pb-4'>
      <div className='flex items-center justify-center py-1'>
        <div className='flex items-center'>
          <Button size='md' shape='circle' variant='ghost' asChild>
            <Link to={`/me/${ORGANIZATIONS}/${team.orgId}/teams`}>
              <ArrowBack />
            </Link>
          </Button>
          <h1 className='flex-1 text-2xl font-semibold leading-7'>{team.name}</h1>
        </div>
      </div>

      <div className='divide-y divide-slate-300 overflow-hidden rounded border border-slate-300 bg-white'>
        <div className='bg-slate-100 px-4 py-2'>
          <div className='flex w-full justify-between'>
            <div className='flex items-center font-bold'>{teamMembers.length} Active</div>
          </div>
        </div>
        {teamMembers.map((teamMember) => (
          <OrgTeamMembersRow
            isViewerLead={isViewerLead}
            isViewerOrgAdmin={isViewerOrgAdmin}
            teamMemberRef={teamMember}
            key={teamMember.id}
          />
        ))}
      </div>

      {menuPortal(
        <OrgTeamMembersMenu menuProps={menuProps} openDeleteTeamModal={openDeleteTeamDialog} />
      )}

      {isDeleteTeamDialogOpened ? (
        <DeleteTeamDialogRoot
          teamId={team.id}
          teamName={team.name}
          teamOrgId={team.orgId}
          onDeleteTeam={closeDeleteTeamDialog}
          onClose={closeDeleteTeamDialog}
        />
      ) : null}
    </div>
  )
}
