import type * as React from 'react'
import {type InviteeDraft, isDraftReady} from '../hooks/useTeamInviteeDrafts'
import TeamInviteeChip from './TeamInviteeChip'

interface Props {
  inputRef: React.RefObject<HTMLInputElement>
  labelledBy: string
  describedBy: string
  drafts: InviteeDraft[]
  inputValue: string
  onInputChange: (value: string) => void
  onCommit: (text: string) => void
  onRemove: (email: string) => void
  onEdit: (email: string) => void
  onSubmit: () => void
  autoFocus?: boolean
}

const SEPARATOR = /[\s,;<>]/

const TeamInviteeInput = (props: Props) => {
  const {inputRef, labelledBy, describedBy, drafts, inputValue} = props
  const {onInputChange, onCommit, onRemove, onEdit, onSubmit, autoFocus} = props
  const hasProblem = drafts.some((draft) => !isDraftReady(draft))

  // Mobile keyboards often skip keydown for characters, so separators are caught as they land in the value
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target
    const lastSeparatorIdx = value.search(/[\s,;<>][^\s,;<>]*$/)
    if (lastSeparatorIdx === -1) {
      onInputChange(value)
      return
    }
    onCommit(value.slice(0, lastSeparatorIdx))
    onInputChange(value.slice(lastSeparatorIdx + 1))
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim() && !e.metaKey && !e.ctrlKey) {
        onCommit(inputValue)
      } else {
        onSubmit()
      }
    } else if (e.key === 'Backspace' && !inputValue && drafts.length > 0) {
      e.preventDefault()
      onEdit(drafts.at(-1)!.email)
    }
  }

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')
    if (!SEPARATOR.test(pastedText.trim())) return
    e.preventDefault()
    onCommit(`${inputValue} ${pastedText}`)
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className='flex min-h-[5.75rem] w-full cursor-text flex-wrap content-start items-center gap-1 rounded border border-hairline-field bg-surface-input p-1.5 focus-within:border-fg-primary hover:border-fg-primary'
    >
      {drafts.length > 0 && (
        <ul className='contents'>
          {drafts.map((draft) => (
            <TeamInviteeChip
              key={draft.email}
              email={draft.email}
              hasProblem={!isDraftReady(draft)}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
      <input
        ref={inputRef}
        type='text'
        inputMode='email'
        autoFocus={autoFocus}
        autoComplete='off'
        autoCapitalize='off'
        autoCorrect='off'
        spellCheck={false}
        maxLength={320}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-invalid={hasProblem || undefined}
        value={inputValue}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={() => inputValue.trim() && onCommit(inputValue)}
        placeholder={drafts.length === 0 ? 'email@example.co, another@example.co' : ''}
        className='m-0 h-7 min-w-48 flex-1 border-0 bg-transparent px-1 text-base text-fg-primary outline-hidden placeholder:text-fg-muted'
      />
    </div>
  )
}

export default TeamInviteeInput
