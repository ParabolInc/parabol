import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {MoreVert, ArrowBack} from '@mui/icons-material'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {OrgTeamMembersQuery} from '../../../../__generated__/OrgTeamMembersQuery.graphql'
import {OrgTeamMembersRow} from './OrgTeamMembersRow'
import {Button} from '../../../../ui/Button/Button'
import AddTeamMemberModal from '../../../../components/AddTeamMemberModal'
import useModal from '../../../../hooks/useModal'
import {Link} from 'react-router-dom'
import {ORGANIZATIONS} from '../../../../utils/constants'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {OrgTeamMembersMenu} from './OrgTeamMembersMenu'

interface Props {
  queryRef: PreloadedQuery<OrgTeamMembersQuery>
}

const query = graphql`
  query OrgTeamMembersQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        ...ArchiveTeam_team
        isLead
        id
        name
        tier
        billingTier
        orgId
        teamMembers(sortBy: "preferredName") {
          id
          isNotRemoved
          ...AddTeamMemberModal_teamMembers
          ...OrgTeamMembersRow_teamMember
        }
      }
    }
  }
`

export const OrgTeamMembers = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<OrgTeamMembersQuery>(query, queryRef)
  const {viewer} = data
  const {team} = viewer
  const {togglePortal: toggleModal, closePortal: closeModal, modalPortal} = useModal()
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)

  if (!team) return null
  const {teamMembers} = team

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

        <div className='ml-auto flex gap-x-2'>
          <Button
            variant='secondary'
            shape='pill'
            className='text-md w-32 self-center py-2'
            onClick={toggleModal}
          >
            Add member
          </Button>
          <Button shape='circle' variant='ghost' ref={originRef} onClick={togglePortal}>
            <MoreVert />
          </Button>
        </div>
      </div>

      <div className='divide-y divide-slate-300 overflow-hidden rounded border border-slate-300 bg-white'>
        <div className='bg-slate-100 px-4 py-2'>
          <div className='flex w-full justify-between'>
            <div className='flex items-center font-bold'>{teamMembers.length} Active</div>
          </div>
        </div>
        {teamMembers.map((teamMember) => (
          <OrgTeamMembersRow key={teamMember.id} teamMemberRef={teamMember} />
        ))}
      </div>

      {modalPortal(
        <AddTeamMemberModal closePortal={closeModal} teamId={team.id} teamMembers={teamMembers} />
      )}

      {menuPortal(<OrgTeamMembersMenu menuProps={menuProps} />)}
    </div>
  )
}
