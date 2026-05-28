import {PersonAdd} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {AddTeamMemberAvatarButton_teamMembers$key} from '../__generated__/AddTeamMemberAvatarButton_teamMembers.graphql'
import useModal from '../hooks/useModal'
import {cn} from '../ui/cn'
import {Tooltip} from '../ui/Tooltip/Tooltip'
import {TooltipContent} from '../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../ui/Tooltip/TooltipTrigger'
import isDemoRoute from '../utils/isDemoRoute'
import lazyPreload from '../utils/lazyPreload'

interface Props {
  meetingId?: string
  teamId: string
  teamMembers: AddTeamMemberAvatarButton_teamMembers$key
}

const AddTeamMemberModal = lazyPreload(
  () => import(/* webpackChunkName: 'AddTeamMemberModal' */ './AddTeamMemberModal')
)

const AddTeamMemberModalDemo = lazyPreload(
  () => import(/* webpackChunkName: 'AddTeamMemberModalDemo' */ './AddTeamMemberModalDemo')
)

const AddTeamMemberAvatarButton = (props: Props) => {
  const {meetingId, teamId, teamMembers: teamMembersRef} = props
  const teamMembers = useFragment(
    graphql`
      fragment AddTeamMemberAvatarButton_teamMembers on TeamMember @relay(plural: true) {
        ...AddTeamMemberModal_teamMembers
      }
    `,
    teamMembersRef
  )
  const isMeeting = !!meetingId
  const {togglePortal: toggleModal, closePortal: closeModal, modalPortal} = useModal()
  const modal = isDemoRoute() ? (
    <AddTeamMemberModalDemo />
  ) : (
    <AddTeamMemberModal
      closePortal={closeModal}
      meetingId={meetingId}
      teamId={teamId}
      teamMembers={teamMembers}
    />
  )
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleModal}
            className={cn(
              'flex cursor-pointer items-center justify-center rounded-full border-2 border-current bg-transparent p-0 text-sky-500 hover:text-sky-600 focus:text-sky-600 active:text-sky-600',
              isMeeting
                ? 'h-8 w-8 text-lg xl:h-12 xl:w-12 xl:text-2xl min-[1600px]:h-14 min-[1600px]:w-14 min-[1600px]:text-[36px]'
                : 'h-8 w-8 text-lg'
            )}
          >
            <PersonAdd fontSize='inherit' sx={{marginLeft: '-1px'}} />
          </button>
        </TooltipTrigger>
        <TooltipContent>Invite to Team</TooltipContent>
      </Tooltip>
      {modalPortal(modal)}
    </>
  )
}

export default AddTeamMemberAvatarButton
