import {useId, useRef, useState} from 'react'
import {Error as ErrorIcon} from '~/ui/icons'
import useTeamInviteeDrafts, {isDraftReady} from '../hooks/useTeamInviteeDrafts'
import useInviteToTeamMutation from '../mutations/useInviteToTeamMutation'
import {MAX_TEAM_INVITEES} from '../shared/teamInviteeEmail'
import {Button} from '../ui/Button/Button'
import TeamInviteeInput from './TeamInviteeInput'
import TeamInviteeMessages from './TeamInviteeMessages'
import TeamInviteSentList from './TeamInviteSentList'

interface Props {
  meetingId: string | undefined
  teamId: string
  teamEmails: readonly string[]
  onClose: () => void
}

const RATE_LIMIT_MESSAGE =
  'You’ve sent a lot of invitations in a short time. Wait a few minutes and try again, or share the invite link.'
const NETWORK_ERROR_MESSAGE =
  'Your invitations didn’t go out because Parabol couldn’t be reached. Check your connection and try again.'

const AddTeamMemberEmailInvites = (props: Props) => {
  const {meetingId, teamId, teamEmails, onClose} = props
  const headingId = useId()
  const hintId = useId()
  const messagesId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const invitees = useTeamInviteeDrafts(teamEmails)
  const {inputValue, setInputValue, drafts, notes, sentEmails, readyEmails} = invitees
  const [execute, submitting] = useInviteToTeamMutation()
  const [requestError, setRequestError] = useState<string | null>(null)
  const batchSize = Math.min(readyEmails.length, MAX_TEAM_INVITEES)
  const leftoverCount = readyEmails.length - batchSize
  const isDone = sentEmails.length > 0 && readyEmails.length === 0

  const commit = (text: string) => {
    invitees.addEmails(text)
    setInputValue('')
  }

  const edit = (email: string) => {
    invitees.editDraft(email)
    inputRef.current?.focus()
  }

  const send = () => {
    if (submitting) return
    const emails = invitees
      .commitInput()
      .filter(isDraftReady)
      .map(({email}) => email)
      .slice(0, MAX_TEAM_INVITEES)
    if (emails.length === 0) return
    setRequestError(null)
    execute({
      variables: {teamId, meetingId, invitees: emails},
      onCompleted: (res, errors) => {
        const firstError = errors?.[0]
        if (firstError) {
          const isRateLimited = firstError.extensions?.code === 'TOO_MANY_REQUESTS'
          setRequestError(isRateLimited ? RATE_LIMIT_MESSAGE : firstError.message)
          return
        }
        invitees.applyResults(res.inviteToTeam.invitees)
      },
      onError: () => setRequestError(NETWORK_ERROR_MESSAGE)
    })
  }

  const label = submitting
    ? 'Sending…'
    : isDone
      ? 'Done'
      : batchSize <= 1
        ? 'Send Invitation'
        : `Send ${batchSize} Invitations`
  return (
    <>
      <h3
        id={headingId}
        className='m-0 flex items-center pb-[3px] font-semibold text-[15px] leading-[21px]'
      >
        Or, send invites by email
      </h3>
      <p id={hintId} className='m-0 pb-4 text-[13px] leading-4'>
        Email invitations expire in 30 days.
      </p>
      <TeamInviteeInput
        inputRef={inputRef}
        labelledBy={headingId}
        describedBy={`${hintId} ${messagesId}`}
        drafts={drafts}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onCommit={commit}
        onRemove={invitees.removeDraft}
        onEdit={edit}
        onSubmit={send}
      />
      <TeamInviteeMessages
        id={messagesId}
        drafts={drafts}
        notes={notes}
        onEdit={edit}
        onRetry={invitees.retryDraft}
        onReplace={invitees.replaceDraft}
      />
      <TeamInviteSentList sentEmails={sentEmails} />
      {requestError && (
        <div role='alert' className='mt-4 flex items-start gap-2 text-sm leading-5'>
          <ErrorIcon className='mt-px shrink-0 text-fg-error text-lg' />
          <span className='font-semibold text-fg-primary'>{requestError}</span>
        </div>
      )}
      <div className='mt-6 flex flex-wrap items-center gap-x-4 gap-y-2'>
        <Button
          variant='primary'
          size='md'
          onClick={isDone ? onClose : send}
          disabled={submitting || (!isDone && batchSize === 0)}
          aria-busy={submitting}
        >
          {label}
        </Button>
        {leftoverCount > 0 && (
          <span className='text-fg-secondary text-sm leading-5'>
            You can invite up to {MAX_TEAM_INVITEES} people at a time. The other {leftoverCount}{' '}
            will stay here for the next batch.
          </span>
        )}
      </div>
    </>
  )
}

export default AddTeamMemberEmailInvites
