import type {
  ChangeEvent,
  ClipboardEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  RefObject
} from 'react'
import {useRef, useState} from 'react'
import type useTeamInviteeDrafts from '../../hooks/useTeamInviteeDrafts'
import {checkInviteeEmail, type InviteeDirectory} from '../../utils/inviteeDirectory'
import {INVITEE_SEPARATOR, splitTypedInvitees} from '../../utils/inviteeInputText'
import {type InviteeOption, isOptionEnabled} from '../../utils/inviteeOptions'
import plural from '../../utils/plural'

type Params = {
  inputRef: RefObject<HTMLInputElement | null>
  autoFocus: boolean | undefined
  invitees: ReturnType<typeof useTeamInviteeDrafts>
  directory: InviteeDirectory | null
  options: InviteeOption[]
  listId: string
  isPopoverOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onShowMore: () => void
  onAnnounce: (text: string) => void
  onEdit: (email: string) => void
  onSubmit: () => void
}

const useInviteeFieldKeys = (params: Params) => {
  const {inputRef, autoFocus, invitees, directory, options, listId, isPopoverOpen} = params
  const {setIsOpen, onShowMore, onAnnounce, onEdit, onSubmit} = params
  const {inputValue, drafts} = invitees
  const isQuietFocusRef = useRef(!!autoFocus)
  const [isPointerActive, setIsPointerActive] = useState(false)
  const [highlight, setHighlight] = useState<{id: string | null; query: string}>({
    id: null,
    query: ''
  })
  if (highlight.id !== null && highlight.query !== inputValue) {
    setHighlight({id: null, query: inputValue})
  }
  const enabledOptions = options.filter(isOptionEnabled)
  const highlightedId = highlight.query === inputValue ? highlight.id : null
  const autoHighlight = inputValue.trim() ? enabledOptions[0] : null
  const active = enabledOptions.find(({id}) => id === highlightedId) ?? autoHighlight ?? null
  const canCommit = (text: string) => !directory || text.includes('@')
  const getOptionDomId = (option: InviteeOption) => `${listId}-${option.id}`

  const highlightOption = (option: InviteeOption) => {
    setHighlight({id: option.id, query: inputValue})
  }

  const focusQuietly = () => {
    isQuietFocusRef.current = true
    inputRef.current?.focus()
  }

  const hoverOption = (option: InviteeOption) => {
    setIsPointerActive(true)
    if (inputValue.trim() && option.id !== active?.id) highlightOption(option)
  }

  const commitTyped = (text: string) => {
    invitees.commitText(text)
    setIsOpen(false)
  }

  const moveHighlight = (step: 1 | -1) => {
    const count = enabledOptions.length
    if (count === 0) return
    const index = active ? enabledOptions.indexOf(active) : step === 1 ? -1 : 0
    const next = enabledOptions[(index + step + count) % count]!
    setIsPointerActive(false)
    highlightOption(next)
    document.getElementById(getOptionDomId(next))?.scrollIntoView({block: 'nearest'})
  }

  const pickOption = (option: InviteeOption) => {
    if (!isOptionEnabled(option)) return
    switch (option.kind) {
      case 'person':
        if (option.isAdded) invitees.removeDraft(option.person.email)
        else invitees.addEmails(option.person.email)
        invitees.setInputValue('')
        onAnnounce('')
        return
      case 'team': {
        const {action, emails, team} = option
        if (action === 'add') invitees.addEmails(emails.join(' '))
        else invitees.removeEmails(emails)
        invitees.setInputValue('')
        const people = `${emails.length} ${plural(emails.length, 'person', 'people')}`
        onAnnounce(`${action === 'add' ? 'Added' : 'Removed'} ${people} from ${team.name}.`)
        return
      }
      case 'email':
        commitTyped(option.email)
        if (directory && checkInviteeEmail(option.email, directory).kind === 'closeToMember') {
          invitees.keepDraft(option.email)
        }
        onAnnounce('')
        return
      case 'showMore':
        onShowMore()
        setHighlight({id: option.firstHiddenId, query: inputValue})
    }
  }

  const clickOption = (option: InviteeOption) => {
    pickOption(option)
    if (option.kind !== 'showMore') setHighlight({id: null, query: inputValue})
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    const {key} = e
    const text = inputValue.trim()
    if ((key === 'ArrowDown' || key === 'ArrowUp') && directory) {
      e.preventDefault()
      if (isPopoverOpen) moveHighlight(key === 'ArrowDown' ? 1 : -1)
      else setIsOpen(true)
    } else if (key === 'Enter') {
      e.preventDefault()
      if (e.metaKey || e.ctrlKey) onSubmit()
      else if (isPopoverOpen && active) pickOption(active)
      else if (!text) onSubmit()
      else if (canCommit(text)) commitTyped(inputValue)
    } else if ((key === ',' || key === ';' || key === ' ') && directory && text.includes('@')) {
      e.preventDefault()
      commitTyped(inputValue)
    } else if (key === 'Backspace' && !inputValue && drafts.length > 0) {
      e.preventDefault()
      const {email} = drafts.at(-1)!
      if (directory?.personByEmail.has(email)) invitees.removeDraft(email)
      else onEdit(email)
    } else if (key === 'Escape' && isPopoverOpen) {
      setIsOpen(false)
    }
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {commit, rest} = splitTypedInvitees(e.target.value, directory !== null)
    if (commit) invitees.addEmails(commit)
    invitees.setInputValue(rest)
    setIsOpen(!commit)
  }

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text')
    if (!INVITEE_SEPARATOR.test(pastedText.trim()) || !canCommit(pastedText)) return
    e.preventDefault()
    commitTyped(`${inputValue} ${pastedText}`)
  }

  const onFocus = () => {
    if (isQuietFocusRef.current) isQuietFocusRef.current = false
    else setIsOpen(true)
  }

  const onBlur = () => {
    isQuietFocusRef.current = false
    setIsOpen(false)
    if (inputValue.trim() && canCommit(inputValue)) invitees.commitText(inputValue)
  }

  const inputProps: InputHTMLAttributes<HTMLInputElement> = {
    role: directory ? 'combobox' : undefined,
    'aria-autocomplete': directory ? 'list' : undefined,
    'aria-expanded': directory ? isPopoverOpen : undefined,
    'aria-controls': isPopoverOpen ? listId : undefined,
    'aria-activedescendant': isPopoverOpen && active ? getOptionDomId(active) : undefined,
    onKeyDown,
    onChange,
    onPaste,
    onFocus,
    onBlur
  }

  return {
    active,
    isPointerActive,
    getOptionDomId,
    hoverOption,
    clickOption,
    focusQuietly,
    inputProps
  }
}

export default useInviteeFieldKeys
