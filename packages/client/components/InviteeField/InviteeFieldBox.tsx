import * as Popover from '@radix-ui/react-popover'
import type {InputHTMLAttributes, RefObject} from 'react'
import {type InviteeDraft, isDraftReady} from '../../hooks/useTeamInviteeDrafts'
import type {InviteeDirectory} from '../../utils/inviteeDirectory'
import TeamInviteeChip from '../TeamInviteeChip'

interface Props {
  inputRef: RefObject<HTMLInputElement | null>
  inputProps: InputHTMLAttributes<HTMLInputElement>
  drafts: InviteeDraft[]
  directory: InviteeDirectory | null
  onOpen: () => void
  onRemove: (email: string) => void
}

const InviteeFieldBox = (props: Props) => {
  const {inputRef, inputProps, drafts, directory, onOpen, onRemove} = props
  const hasProblem = drafts.some((draft) => !isDraftReady(draft))
  const emptyPlaceholder = directory ? 'Name or email' : 'email@example.co, another@example.co'
  return (
    <Popover.Anchor asChild>
      <div
        onMouseDown={(e) => {
          if (directory && e.target !== inputRef.current) e.preventDefault()
        }}
        onClick={() => {
          inputRef.current?.focus()
          onOpen()
        }}
        className='flex w-full cursor-text flex-wrap content-start items-center gap-1 rounded border border-hairline-field bg-surface-input p-1.5 focus-within:border-fg-primary hover:border-fg-primary'
      >
        {drafts.length > 0 && (
          <ul className='contents'>
            {drafts.map((draft) => {
              const person = directory?.personByEmail.get(draft.email)
              return (
                <TeamInviteeChip
                  key={draft.email}
                  email={draft.email}
                  person={person}
                  showMailIcon={directory !== null && !person}
                  hasProblem={!isDraftReady(draft)}
                  onRemove={onRemove}
                />
              )
            })}
          </ul>
        )}
        <input
          {...inputProps}
          ref={inputRef}
          type='text'
          inputMode={directory ? 'text' : 'email'}
          autoComplete='off'
          autoCapitalize='off'
          autoCorrect='off'
          spellCheck={false}
          maxLength={320}
          aria-invalid={hasProblem || undefined}
          placeholder={drafts.length === 0 ? emptyPlaceholder : ''}
          className='m-0 h-7 min-w-48 flex-1 border-0 bg-transparent px-1 text-base text-fg-primary outline-hidden placeholder:text-fg-muted'
        />
      </div>
    </Popover.Anchor>
  )
}

export default InviteeFieldBox
