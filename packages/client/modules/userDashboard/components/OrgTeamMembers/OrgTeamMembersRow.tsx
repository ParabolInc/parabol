import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {OrgTeamMembersRow_teamMember$key} from '../../../../__generated__/OrgTeamMembersRow_teamMember.graphql'
import {Avatar} from '../../../../ui/Avatar/Avatar'
import {AvatarFallback} from '../../../../ui/Avatar/AvatarFallback'
import {AvatarImage} from '../../../../ui/Avatar/AvatarImage'
import {Button} from '../../../../ui/Button/Button'
import {MoreVert} from '@mui/icons-material'
import {OrgTeamMemberMenu} from './OrgTeamMemberMenu'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import PromoteTeamMemberModal from '../../../teamDashboard/components/PromoteTeamMemberModal/PromoteTeamMemberModal'
import RemoveTeamMemberModal from '../../../teamDashboard/components/RemoveTeamMemberModal/RemoveTeamMemberModal'
import useModal from '../../../../hooks/useModal'
import useAtmosphere from '../../../../hooks/useAtmosphere'

type Props = {
  teamMemberRef: OrgTeamMembersRow_teamMember$key
  isViewerLead: boolean
  isViewerOrgAdmin: boolean
}

export const OrgTeamMembersRow = (props: Props) => {
  const {teamMemberRef} = props
  const teamMember = useFragment(
    graphql`
      fragment OrgTeamMembersRow_teamMember on TeamMember {
        ...OrgTeamMemberMenu_teamMember
        userId
        picture
        preferredName
        isLead
        isOrgAdmin
        isSelf
        email
        ...PromoteTeamMemberModal_teamMember
        ...RemoveTeamMemberModal_teamMember
      }
    `,
    teamMemberRef
  )

  const {isViewerLead, isViewerOrgAdmin} = props
  const {isLead, isOrgAdmin, userId} = teamMember

  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isSelf = userId === viewerId

  const showMenuButton = (isViewerOrgAdmin && !isLead) || (isViewerLead && !isSelf && !isOrgAdmin)

  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const {
    closePortal: closePromote,
    togglePortal: togglePromote,
    modalPortal: portalPromote
  } = useModal()
  const {
    closePortal: closeRemove,
    togglePortal: toggleRemove,
    modalPortal: portalRemove
  } = useModal()

  return (
    <div className='flex w-full items-center justify-center gap-4 p-4'>
      <div>
        <Avatar className='h-8 w-8'>
          <AvatarImage src={teamMember.picture} alt={teamMember.preferredName} />
          <AvatarFallback>{teamMember.preferredName.substring(0, 2)}</AvatarFallback>
        </Avatar>
      </div>
      <div className='flex w-full flex-col gap-y-1 py-1'>
        <div className='text-gray-700 inline-flex items-center gap-x-2 text-lg font-bold'>
          {teamMember.preferredName}{' '}
          {teamMember.isLead ? (
            <span className='rounded-full bg-primary px-2 py-0.5 text-xs text-white'>
              Team Lead
            </span>
          ) : null}
        </div>
        <div>
          <Button asChild variant='link'>
            <a href={`mailto:${teamMember.email}`}>{teamMember.email}</a>
          </Button>
        </div>
      </div>
      <div>
        {showMenuButton && (
          <Button
            disabled={!showMenuButton}
            shape='circle'
            variant='ghost'
            onClick={togglePortal}
            ref={originRef}
          >
            <MoreVert />
          </Button>
        )}
        {menuPortal(
          <OrgTeamMemberMenu
            menuProps={menuProps}
            isLead={teamMember.isLead}
            teamMember={teamMember}
            isViewerLead={isViewerLead}
            isViewerOrgAdmin={isViewerOrgAdmin}
            togglePromote={togglePromote}
            toggleRemove={toggleRemove}
          />
        )}
      </div>

      {portalPromote(<PromoteTeamMemberModal teamMember={teamMember} closePortal={closePromote} />)}
      {portalRemove(<RemoveTeamMemberModal teamMember={teamMember} closePortal={closeRemove} />)}
    </div>
  )
}
