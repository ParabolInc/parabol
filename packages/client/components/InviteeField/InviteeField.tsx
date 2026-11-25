import * as Popover from '@radix-ui/react-popover'
import {useId, useRef, useState} from 'react'
import type useTeamInviteeDrafts from '../../hooks/useTeamInviteeDrafts'
import type {InviteeDirectory} from '../../utils/inviteeDirectory'
import TeamInviteeExcessMessage from '../TeamInviteeExcessMessage'
import TeamInviteeMessages from '../TeamInviteeMessages'
import InviteeFieldBox from './InviteeFieldBox'
import InviteeFieldOptions from './InviteeFieldOptions'
import useInviteeFieldKeys from './useInviteeFieldKeys'
import useInviteeFieldOptions from './useInviteeFieldOptions'

export type InviteeFieldProps = {
  invitees: ReturnType<typeof useTeamInviteeDrafts>
  directory: InviteeDirectory | null
  teamEmails: readonly string[]
  targetTeamId: string | null
  capacity: number | null
  labelledBy: string
  describedBy?: string
  onSubmit: () => void
  autoFocus?: boolean
}

const InviteeField = (props: InviteeFieldProps) => {
  const {invitees, directory, teamEmails, targetTeamId, capacity} = props
  const {labelledBy, describedBy, onSubmit, autoFocus} = props
  const {drafts, notes, inputValue} = invitees
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const messagesId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [showAllPartners, setShowAllPartners] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const options = useInviteeFieldOptions({
    invitees,
    directory,
    teamEmails,
    targetTeamId,
    capacity,
    isOpen,
    showAllPartners
  })

  const edit = (email: string) => {
    invitees.editDraft(email)
    inputRef.current?.focus()
  }

  const keys = useInviteeFieldKeys({
    inputRef,
    autoFocus,
    invitees,
    directory,
    options: options?.sections.flatMap((section) => section.options) ?? [],
    listId,
    isPopoverOpen: options !== null,
    setIsOpen,
    onShowMore: () => setShowAllPartners(true),
    onAnnounce: setAnnouncement,
    onEdit: edit,
    onSubmit
  })
  const {
    active,
    isPointerActive,
    getOptionDomId,
    hoverOption,
    clickOption,
    focusQuietly,
    inputProps
  } = keys

  return (
    <>
      <Popover.Root open={options !== null}>
        <InviteeFieldBox
          inputRef={inputRef}
          inputProps={{
            ...inputProps,
            autoFocus,
            value: inputValue,
            'aria-labelledby': labelledBy,
            'aria-describedby': describedBy ? `${describedBy} ${messagesId}` : messagesId
          }}
          drafts={drafts}
          directory={directory}
          onOpen={() => setIsOpen(true)}
          onRemove={invitees.removeDraft}
        />
        {options && directory && (
          <InviteeFieldOptions
            inputRef={inputRef}
            listId={listId}
            options={options}
            orgName={directory.orgName}
            query={inputValue}
            active={active}
            isPointerActive={isPointerActive}
            getOptionDomId={getOptionDomId}
            onHighlight={hoverOption}
            onPick={clickOption}
          />
        )}
      </Popover.Root>
      {capacity !== null && <TeamInviteeExcessMessage excess={Math.max(-capacity, 0)} />}
      <TeamInviteeMessages
        id={messagesId}
        drafts={drafts}
        notes={notes}
        directory={directory}
        onEdit={edit}
        onRetry={invitees.retryDraft}
        onReplace={(email, nextEmail) => {
          invitees.replaceDraft(email, nextEmail)
          focusQuietly()
        }}
        onKeep={(email) => {
          invitees.keepDraft(email)
          focusQuietly()
        }}
      />
      <span aria-live='polite' className='sr-only'>
        {announcement}
      </span>
    </>
  )
}

export default InviteeField
