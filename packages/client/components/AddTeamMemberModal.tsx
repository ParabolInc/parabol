import {Error as ErrorIcon, Warning} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import type * as React from 'react'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useMutationProps from '~/hooks/useMutationProps'
import modalTeamInvitePng from '../../../static/images/illustrations/illus-modal-team-invite.png'
import type {AddTeamMemberModal_teamMembers$key} from '../__generated__/AddTeamMemberModal_teamMembers.graphql'
import type {InviteToTeamMutation as TInviteToTeamMutation} from '../__generated__/InviteToTeamMutation.graphql'
import useBreakpoint from '../hooks/useBreakpoint'
import InviteToTeamMutation from '../mutations/InviteToTeamMutation'
import type {CompletedHandler} from '../types/relayMutations'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import parseEmailAddressList from '../utils/parseEmailAddressList'
import plural from '../utils/plural'
import AddTeamMemberModalSuccess from './AddTeamMemberModalSuccess'
import BasicTextArea from './InputField/BasicTextArea'
import MassInvitationTokenLinkRoot from './MassInvitationTokenLinkRoot'
import PrimaryButton from './PrimaryButton'

interface Props {
  isOpen: boolean
  onClose: () => void
  meetingId?: string | undefined
  teamMembers: AddTeamMemberModal_teamMembers$key
  teamId: string
}

const INVITE_DIALOG_BREAKPOINT = 864

const AddTeamMemberModal = (props: Props) => {
  const {isOpen, onClose, meetingId, teamMembers: teamMembersRef, teamId} = props
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
  const [pendingSuccessfulInvitations, setPendingSuccessfulInvitations] = useState([] as string[])
  const [successfulInvitations, setSuccessfulInvitations] = useState<string[] | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [rawInvitees, setRawInvitees] = useState('')
  const [invitees, setInvitees] = useState([] as string[])
  const {error, onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const atmosphere = useAtmosphere()
  const showIllustration = useBreakpoint(INVITE_DIALOG_BREAKPOINT)

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSubmitted) setIsSubmitted(false)
    const nextValue = e.target.value
    if (rawInvitees === nextValue) return
    const {parsedInvitees, invalidEmailExists} = parseEmailAddressList(nextValue)
    const allInvitees = parsedInvitees
      ? (parsedInvitees.map((invitee: any) => invitee.address) as string[])
      : []
    const teamEmailSet = new Set(teamMembers.map(({user}) => user.email))
    const uniqueInvitees = Array.from(new Set(allInvitees))
    if (invalidEmailExists) {
      const lastValidEmail = uniqueInvitees[uniqueInvitees.length - 1]
      lastValidEmail
        ? onError(new Error(`Invalid email(s) after ${lastValidEmail}`))
        : onError(new Error(`Invalid email(s)`))
    } else {
      onCompleted()
    }
    const offTeamInvitees = uniqueInvitees.filter((email) => !teamEmailSet.has(email))
    const alreadyInvitedEmails = uniqueInvitees.filter((email) => teamEmailSet.has(email))

    setRawInvitees(nextValue)
    setInvitees(offTeamInvitees)
    if (!invalidEmailExists) {
      if (alreadyInvitedEmails.length === 1) {
        onError(new Error(`${alreadyInvitedEmails} is already on the team`))
      } else if (alreadyInvitedEmails.length === 2) {
        onError(
          new Error(
            `${alreadyInvitedEmails[0]} and ${alreadyInvitedEmails[1]} are already on the team`
          )
        )
      } else if (alreadyInvitedEmails.length > 2) {
        onError(
          new Error(
            `${alreadyInvitedEmails[0]} and ${
              alreadyInvitedEmails.length - 1
            } other emails are already on the team`
          )
        )
      }
    }
  }

  const sendInvitations = () => {
    if (invitees.length === 0) return
    submitMutation()
    const handleCompleted: CompletedHandler<TInviteToTeamMutation['response']> = (res) => {
      setIsSubmitted(true)
      onCompleted()
      if (res) {
        const {inviteToTeam} = res
        if (inviteToTeam.invitees?.length === invitees.length) {
          setSuccessfulInvitations(pendingSuccessfulInvitations.concat(inviteToTeam.invitees))
        } else {
          const goodInvitees = invitees.filter((invitee) =>
            inviteToTeam.invitees?.includes(invitee)
          )
          const badInvitees = invitees.filter(
            (invitee) => !inviteToTeam.invitees?.includes(invitee)
          )

          onError(
            new Error(
              `Could not send an invitation to the above ${plural(
                badInvitees.length,
                'email'
              )}. Try sharing the link`
            )
          )
          setInvitees(badInvitees)
          setRawInvitees(badInvitees.join(', '))
          setPendingSuccessfulInvitations(pendingSuccessfulInvitations.concat(goodInvitees))
        }
      }
    }
    InviteToTeamMutation(
      atmosphere,
      {meetingId, teamId, invitees},
      {onError, onCompleted: handleCompleted}
    )
  }

  const title = invitees.length <= 1 ? 'Send Invitation' : `Send ${invitees.length} Invitations`
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent className={showIllustration ? 'md:w-[816px] md:max-w-[816px]' : ''}>
        {successfulInvitations ? (
          <AddTeamMemberModalSuccess
            onClose={onClose}
            successfulInvitations={successfulInvitations}
          />
        ) : (
          <div className='flex flex-row'>
            {showIllustration && (
              <div
                className='w-[339px] shrink-0 bg-center bg-no-repeat'
                style={{
                  backgroundImage: `url(${modalTeamInvitePng})`,
                  backgroundSize: '80%'
                }}
              />
            )}
            <div className='flex-1'>
              <h2 className='mb-2 font-semibold text-2xl leading-8'>Invite to Team</h2>
              <div className='flex items-center'>
                <div className='w-full'>
                  <h3 className='m-0 flex items-center pb-[3px] font-semibold text-[15px] leading-[21px]'>
                    Share this link
                  </h3>
                  <p className='m-0 pb-4 text-[13px] leading-4'>This link expires in 30 days.</p>
                  <div className='mb-8'>
                    <MassInvitationTokenLinkRoot meetingId={meetingId} teamId={teamId} />
                  </div>

                  <h3 className='m-0 flex items-center pb-[3px] font-semibold text-[15px] leading-[21px]'>
                    Or, send invites by email
                  </h3>
                  <p className='m-0 pb-4 text-[13px] leading-4'>
                    Email invitations expire in 30 days.
                  </p>
                  <BasicTextArea
                    autoFocus
                    name='rawInvitees'
                    onChange={onChange}
                    placeholder='email@example.co, another@example.co'
                    value={rawInvitees}
                  />
                  {error && (
                    <div
                      className={`mt-2 flex items-center p-2 ${!isSubmitted ? 'text-gold-500' : 'text-tomato-500'}`}
                    >
                      <div className='mr-2 h-6 w-6'>
                        {isSubmitted ? <ErrorIcon /> : <Warning />}
                      </div>
                      <div className='font-semibold text-sm'>{error.message}</div>
                    </div>
                  )}
                  <div className='mt-6 flex justify-start'>
                    <PrimaryButton
                      onClick={sendInvitations}
                      disabled={invitees.length === 0}
                      size='medium'
                      waiting={submitting}
                    >
                      {title}
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AddTeamMemberModal
