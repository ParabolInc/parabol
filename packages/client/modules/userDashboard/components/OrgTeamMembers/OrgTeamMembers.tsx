import {ArrowBack} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Link} from 'react-router-dom'
import {OrgTeamMembersQuery} from '../../../../__generated__/OrgTeamMembersQuery.graphql'
import DeleteTeamDialog from '../../../../components/DeleteTeamDialog'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {Button} from '../../../../ui/Button/Button'
import {useDialogState} from '../../../../ui/Dialog/useDialogState'
import {ORGANIZATIONS} from '../../../../utils/constants'
import {OrgTeamMembersMenu} from './OrgTeamMembersMenu'
import {OrgTeamMembersRow} from './OrgTeamMembersRow'

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

      <div className='divide-y divide-slate-300 overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm'>
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
        <DeleteTeamDialog
          isOpen={isDeleteTeamDialogOpened}
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
