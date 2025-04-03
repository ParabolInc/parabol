import {MoreVert} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {OrgTeamMembersRow_teamMember$key} from '../../../../__generated__/OrgTeamMembersRow_teamMember.graphql'
import Avatar from '../../../../components/Avatar/Avatar'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useModal from '../../../../hooks/useModal'
import {Button} from '../../../../ui/Button/Button'
import PromoteTeamMemberModal from '../../../teamDashboard/components/PromoteTeamMemberModal/PromoteTeamMemberModal'
import RemoveTeamMemberModal from '../../../teamDashboard/components/RemoveTeamMemberModal/RemoveTeamMemberModal'
import {OrgTeamMemberMenu} from './OrgTeamMemberMenu'

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
        user {
          id
          picture
          preferredName
          email
        }
        isLead
        isOrgAdmin
        isSelf
        ...PromoteTeamMemberModal_teamMember
        ...RemoveTeamMemberModal_teamMember
      }
    `,
    teamMemberRef
  )

  const {isViewerLead, isViewerOrgAdmin} = props
  const {isLead, isOrgAdmin, user} = teamMember
  const {id: userId, picture, preferredName, email} = user

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
        <Avatar className='h-8 w-8' picture={picture} alt={preferredName} />
      </div>
      <div className='flex w-full flex-col gap-y-1 py-1'>
        <div className='text-gray-700 inline-flex items-center gap-x-2 text-lg font-bold'>
          {preferredName}{' '}
          {teamMember.isLead ? (
            <span className='rounded-full bg-primary px-2 py-0.5 text-xs text-white'>
              Team Lead
            </span>
          ) : null}
        </div>
        <div>
          <Button asChild variant='link'>
            <a href={`mailto:${email}`}>{email}</a>
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
