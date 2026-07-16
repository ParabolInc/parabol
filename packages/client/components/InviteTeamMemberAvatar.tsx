import {PersonAdd} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import type {InviteTeamMemberAvatar_teamMembers$key} from '../__generated__/InviteTeamMemberAvatar_teamMembers.graphql'
import AddTeamMemberModal from './AddTeamMemberModal'

interface Props {
  meetingId?: string
  teamId: string
  teamMembers: InviteTeamMemberAvatar_teamMembers$key
}

const InviteTeamMemberAvatar = (props: Props) => {
  const {meetingId, teamId} = props
  const teamMembers = useFragment(
    graphql`
      fragment InviteTeamMemberAvatar_teamMembers on TeamMember @relay(plural: true) {
        ...AddTeamMemberModal_teamMembers
      }
    `,
    props.teamMembers
  )
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <div
        className='mx-1.5 cursor-pointer hover:[&_span]:text-sky-600'
        onClick={() => setIsOpen(true)}
      >
        <div className='flex h-7 justify-center'>
          <span className='h-6 w-6 self-center text-accent'>
            <PersonAdd />
          </span>
        </div>
        <div className='text-center font-semibold text-fg-primary text-xs leading-4'>Invite</div>
      </div>
      <AddTeamMemberModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        meetingId={meetingId}
        teamId={teamId}
        teamMembers={teamMembers}
      />
    </>
  )
}

export default InviteTeamMemberAvatar
