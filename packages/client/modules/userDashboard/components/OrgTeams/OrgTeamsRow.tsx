import {DeleteOutline} from '@mui/icons-material'
import IconButton from '@mui/material/IconButton'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import {OrgTeamsRow_team$key} from '../../../../__generated__/OrgTeamsRow_team.graphql'
import useModal from '../../../../hooks/useModal'
import plural from '../../../../utils/plural'
import ArchiveTeamModal from './ArchiveTeamModal'

type Props = {
  teamRef: OrgTeamsRow_team$key
  isOrgAdmin: boolean
}

const OrgTeamsRow = (props: Props) => {
  const {teamRef, isOrgAdmin} = props
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
          preferredName
        }
      }
    `,
    teamRef
  )
  const {id: teamId, teamMembers, name} = team
  const teamMembersCount = teamMembers.length
  const viewerTeamMember = teamMembers.find((m) => m.isSelf)
  if (!viewerTeamMember && !isOrgAdmin) return null
  const {isLead: viewerIsLead} = viewerTeamMember ?? {isLead: false}
  const teamLead = teamMembers.find((m) => m.isLead)
  const teamLeadName = teamLead && !viewerTeamMember?.isLead ? teamLead.preferredName : null
  const {togglePortal, modalPortal} = useModal()

  return (
    <>
      <div className='flex items-center justify-between p-4 hover:bg-slate-100'>
        <div className='flex flex-col'>
          <div className='inline-flex items-center items-center gap-x-2'>
            <Link to={`teams/${teamId}`} className='inline-block text-lg font-bold text-sky-500'>
              {name}
            </Link>
            {viewerIsLead && (
              <span className='rounded-full bg-sky-700 px-2 py-0.5 text-xs text-white'>
                Lead team
              </span>
            )}
            {!viewerIsLead && !isOrgAdmin && (
              <span className='rounded-full bg-grass-500 px-2 py-0.5 text-xs text-white'>
                Member team
              </span>
            )}
          </div>
          <div className='text-gray-600'>
            {`${teamMembersCount} ${plural(teamMembersCount, 'member')}`}
          </div>
        </div>
        {(viewerIsLead || isOrgAdmin) && (
          <div className='flex items-center'>
            <IconButton
              onClick={togglePortal}
              aria-label='Archive team'
              className='text-tomato-500 hover:text-tomato-600'
            >
              <DeleteOutline />
            </IconButton>
            <span className='ml-2 text-sm text-slate-600'>Archive Team</span>
          </div>
        )}
      </div>
      {modalPortal(
        <ArchiveTeamModal
          closeModal={togglePortal}
          teamId={teamId}
          teamName={name}
          teamLeadName={teamLeadName}
        />
      )}
    </>
  )
}

export default OrgTeamsRow
