import {useRef, useState} from 'react'
import {MAX_TEAM_STRUCTURE_NAME_LENGTH} from '../../../../shared/reports/reportCatalog'
import {cn} from '../../../../ui/cn'

interface Props {
  label: string
  initialName?: string
  placeholder?: string
  autoFocus?: boolean
  className?: string
  onCommit: (name: string) => void
  onClose?: () => void
}

// Saves on Enter or when focus leaves, and Escape puts the name back
const OrgTeamStructureNameInput = ({
  label,
  initialName = '',
  placeholder,
  autoFocus = true,
  className,
  onCommit,
  onClose
}: Props) => {
  const [name, setName] = useState(initialName)
  const isCancelled = useRef(false)
  const onBlur = () => {
    const trimmedName = name.trim()
    if (isCancelled.current || !trimmedName) {
      setName(initialName)
    } else if (trimmedName !== initialName) {
      onCommit(trimmedName)
    }
    isCancelled.current = false
    onClose?.()
  }
  return (
    <input
      aria-label={label}
      value={name}
      placeholder={placeholder}
      maxLength={MAX_TEAM_STRUCTURE_NAME_LENGTH}
      autoFocus={autoFocus}
      onChange={(e) => setName(e.target.value)}
      onBlur={onBlur}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== 'Escape') return
        e.preventDefault()
        isCancelled.current = e.key === 'Escape'
        e.currentTarget.blur()
      }}
      className={cn(
        'h-7 min-w-0 rounded-sm border border-hairline-field bg-surface-input px-2 font-semibold text-[13px] text-fg-primary outline-hidden placeholder:font-normal placeholder:text-fg-muted focus-visible:border-accent',
        className
      )}
    />
  )
}

export default OrgTeamStructureNameInput
