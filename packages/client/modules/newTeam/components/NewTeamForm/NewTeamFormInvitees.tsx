import {useId, useRef} from 'react'
import Checkbox from '../../../../components/Checkbox'
import TeamInviteeInput from '../../../../components/TeamInviteeInput'
import TeamInviteeMessages from '../../../../components/TeamInviteeMessages'
import type useTeamInviteeDrafts from '../../../../hooks/useTeamInviteeDrafts'

interface Props {
  invitees: ReturnType<typeof useTeamInviteeDrafts>
  orgName: string | null
  orgTeammateEmails: string[]
  onSubmit: () => void
}

const NewTeamFormInvitees = (props: Props) => {
  const {invitees, orgName, orgTeammateEmails, onSubmit} = props
  const {drafts, notes, inputValue, setInputValue} = invitees
  const hintId = useId()
  const messagesId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const isInvitingOrgTeammates =
    orgTeammateEmails.length > 0 &&
    orgTeammateEmails.every((email) => drafts.some((draft) => draft.email === email))

  const toggleOrgTeammates = () => {
    if (isInvitingOrgTeammates) {
      invitees.removeEmails(orgTeammateEmails)
    } else {
      invitees.addEmails(orgTeammateEmails.join(' '))
    }
  }

  const edit = (email: string) => {
    invitees.editDraft(email)
    inputRef.current?.focus()
  }

  return (
    <>
      <p id={hintId} className='mt-8 mb-3 text-xs leading-4'>
        {'Invite others to your new team. Invites expire in 30 days.'}
      </p>
      <TeamInviteeInput
        inputRef={inputRef}
        labelledBy={hintId}
        describedBy={messagesId}
        drafts={drafts}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onCommit={invitees.commitText}
        onRemove={invitees.removeDraft}
        onEdit={edit}
        onSubmit={onSubmit}
      />
      <TeamInviteeMessages
        id={messagesId}
        drafts={drafts}
        notes={notes}
        onEdit={edit}
        onRetry={invitees.retryDraft}
        onReplace={invitees.replaceDraft}
      />
      {orgName && (
        <div className='flex cursor-pointer items-center pt-2' onClick={toggleOrgTeammates}>
          <Checkbox active={isInvitingOrgTeammates} />
          <label htmlFor='checkbox' className='ml-2 cursor-pointer text-fg-primary'>
            {`Invite team members from ${orgName}`}
          </label>
        </div>
      )}
    </>
  )
}

export default NewTeamFormInvitees
