import graphql from 'babel-plugin-relay/macro'
import {Suspense, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import type {ManageTeamMember_teamMember$key} from '~/__generated__/ManageTeamMember_teamMember.graphql'
import {MoreVert as MoreVertIcon} from '~/ui/icons'
import Avatar from '../../../../components/Avatar/Avatar'
import Row from '../../../../components/Row/Row'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useScrollIntoView from '../../../../hooks/useScrollIntoVIew'
import {Button} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'
import {Menu} from '../../../../ui/Menu/Menu'
import lazyPreload from '../../../../utils/lazyPreload'
import LeaveTeamModal from '../LeaveTeamModal/LeaveTeamModal'
import PromoteTeamMemberModal from '../PromoteTeamMemberModal/PromoteTeamMemberModal'
import RemoveTeamMemberModal from '../RemoveTeamMemberModal/RemoveTeamMemberModal'

const TeamMemberAvatarMenu = lazyPreload(
  () =>
    import(
      /* webpackChunkName: 'TeamMemberAvatarMenu' */ '../../../../components/DashboardAvatars/TeamMemberAvatarMenu'
    )
)

interface Props {
  isViewerLead: boolean
  isViewerOrgAdmin: boolean
  manageTeamMemberId?: string | null
  teamMember: ManageTeamMember_teamMember$key
}

const ManageTeamMember = (props: Props) => {
  const {isViewerLead, isViewerOrgAdmin, manageTeamMemberId} = props
  const teamMember = useFragment(
    graphql`
      fragment ManageTeamMember_teamMember on TeamMember {
        ...TeamMemberAvatarMenu_teamMember
        ...LeaveTeamModal_teamMember
        ...PromoteTeamMemberModal_teamMember
        ...RemoveTeamMemberModal_teamMember
        id
        isLead
        isOrgAdmin
        user {
          id
          preferredName
          picture
        }
      }
    `,
    props.teamMember
  )
  const {id: teamMemberId, isLead, isOrgAdmin, user} = teamMember
  const {id: userId, preferredName, picture} = user
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isSelf = userId === viewerId
  const isSelectedAvatar = manageTeamMemberId === teamMemberId
  // Team management permissions:
  // * Org admin can do anything, including promote themselves to team lead, and remove non-lead
  //   team members
  // * Team leads can do anything
  // * Non-lead non-admins can only leave the team
  // Show the menu iff:
  // 1. Viewer is an admin, and the user is not a lead (viewer can promote them a lead, or remove
  //    from team).
  // 2. Viewer is a lead, and user is not the viewer, and not an admin (viewer can promote to lead,
  //    or remove from team).
  // 3. User is the viewer, and the user is not a lead (can leave team).
  const showMenuButton = isViewerLead ? !isSelf : isSelf || isViewerOrgAdmin
  const [isPromoteOpen, setIsPromoteOpen] = useState(false)
  const [isRemoveOpen, setIsRemoveOpen] = useState(false)
  const [isLeaveOpen, setIsLeaveOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useScrollIntoView(ref, isSelectedAvatar)

  return (
    <Row ref={ref} className='border-t-0 py-2 pr-2 pl-4'>
      <Avatar className='h-6 w-6' picture={picture} />
      <div className='flex flex-1 flex-col flex-wrap items-start'>
        <div className='px-4 font-normal text-fg-primary text-sm [word-break:break-word]'>
          {preferredName}
        </div>
        <div
          className={cn(
            isLead || isOrgAdmin ? 'flex' : 'hidden',
            'px-4 text-fg-primary text-xs leading-3'
          )}
        >
          {isLead && 'Team Lead'}
          {isLead && isOrgAdmin && ', '}
          {isOrgAdmin && 'Org Admin'}
        </div>
      </div>
      <Menu
        trigger={
          <Button
            variant='flat'
            size='sm'
            className={cn(showMenuButton ? 'flex' : 'hidden', 'p-0 text-[18px] text-fg-secondary')}
            onMouseEnter={TeamMemberAvatarMenu.preload}
          >
            <div className='h-[18px] w-[18px] [&_svg]:text-[18px]'>
              <MoreVertIcon />
            </div>
          </Button>
        }
      >
        <Suspense fallback={null}>
          <TeamMemberAvatarMenu
            isLead={isLead}
            isViewerLead={isViewerLead}
            isViewerOrgAdmin={isViewerOrgAdmin}
            teamMember={teamMember}
            togglePromote={() => setIsPromoteOpen(true)}
            toggleRemove={() => setIsRemoveOpen(true)}
            toggleLeave={() => setIsLeaveOpen(true)}
          />
        </Suspense>
      </Menu>
      <PromoteTeamMemberModal
        isOpen={isPromoteOpen}
        teamMember={teamMember}
        closePortal={() => setIsPromoteOpen(false)}
      />
      <RemoveTeamMemberModal
        isOpen={isRemoveOpen}
        teamMember={teamMember}
        closePortal={() => setIsRemoveOpen(false)}
      />
      <LeaveTeamModal
        isOpen={isLeaveOpen}
        teamMember={teamMember}
        closePortal={() => setIsLeaveOpen(false)}
      />
    </Row>
  )
}

export default ManageTeamMember
