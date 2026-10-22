import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import modalTeamInvitePng from '../../../static/images/illustrations/illus-modal-team-invite.png'
import type {AddTeamMemberModal_teamMembers$key} from '../__generated__/AddTeamMemberModal_teamMembers.graphql'
import useBreakpoint from '../hooks/useBreakpoint'
import type {TeamInviteeResult} from '../hooks/useTeamInviteeDrafts'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import AddTeamMemberEmailInvites from './AddTeamMemberEmailInvites'
import MassInvitationTokenLinkRoot from './MassInvitationTokenLinkRoot'

interface Props {
  isOpen: boolean
  onClose: () => void
  meetingId?: string | undefined
  teamMembers: AddTeamMemberModal_teamMembers$key
  teamId: string
  initialResults?: readonly TeamInviteeResult[]
}

const INVITE_DIALOG_BREAKPOINT = 864

const AddTeamMemberModal = (props: Props) => {
  const {isOpen, onClose, meetingId, teamMembers: teamMembersRef, teamId, initialResults} = props
  const teamMembers = useFragment(
    graphql`
      fragment AddTeamMemberModal_teamMembers on TeamMember @relay(plural: true) {
        user {
          id
          email
        }
      }
    `,
    teamMembersRef
  )
  const showIllustration = useBreakpoint(INVITE_DIALOG_BREAKPOINT)
  const teamEmails = teamMembers.map(({user}) => user.email)
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className={showIllustration ? 'md:w-[816px] md:max-w-[816px]' : ''}>
        <div className='flex flex-row gap-6'>
          {showIllustration && (
            <div
              className='w-[339px] shrink-0 rounded-lg bg-center bg-lilac-100 bg-no-repeat'
              style={{
                backgroundImage: `url(${modalTeamInvitePng})`,
                backgroundSize: '80%'
              }}
            />
          )}
          <div className='min-w-0 flex-1'>
            <DialogTitle className='mb-2 text-2xl leading-8'>Invite to Team</DialogTitle>
            <h3 className='m-0 flex items-center pb-[3px] font-semibold text-[15px] leading-[21px]'>
              Share this link
            </h3>
            <p className='m-0 pb-4 text-[13px] leading-4'>This link expires in 30 days.</p>
            <div className='mb-8'>
              <MassInvitationTokenLinkRoot meetingId={meetingId} teamId={teamId} />
            </div>
            <AddTeamMemberEmailInvites
              meetingId={meetingId}
              teamId={teamId}
              teamEmails={teamEmails}
              initialResults={initialResults}
              onClose={onClose}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddTeamMemberModal
