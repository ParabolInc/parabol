import type {ReactNode} from 'react'
import {OpenInNew} from '~/ui/icons'
import {SprintPokerDefaults} from '../types/constEnums'
import {Select} from '../ui/Select/Select'
import {SelectContent} from '../ui/Select/SelectContent'
import {SelectItem} from '../ui/Select/SelectItem'
import {SelectSeparator} from '../ui/Select/SelectSeparator'
import {SelectTrigger} from '../ui/Select/SelectTrigger'
import {fromSelectValue, SERVICE_FIELD_NULL_VALUE} from '../utils/serviceFieldSelectValue'

// picking this doesn't change the field, it opens the service's docs
const MISSING_FIELD = '__missingField'

const SENTINEL_LABELS: Record<string, string> = {
  [SprintPokerDefaults.SERVICE_FIELD_COMMENT]: SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL,
  [SprintPokerDefaults.SERVICE_FIELD_NULL]: SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL
}

interface ServiceFieldOption {
  fieldId: string
  label: string
}

interface Props {
  hasEmptyFieldList: boolean
  helpUrl: string | null | undefined
  onOpenChange: (isOpen: boolean) => void
  onOpenHelp: () => void
  onSelectField: (fieldId: string, label: string) => void
  options: readonly ServiceFieldOption[]
  serviceFieldId: string
  trigger: ReactNode
}

const EstimateFieldSelect = (props: Props) => {
  const {
    hasEmptyFieldList,
    helpUrl,
    onOpenChange,
    onOpenHelp,
    onSelectField,
    options,
    serviceFieldId,
    trigger
  } = props
  const isListed = options.some((option) => option.fieldId === serviceFieldId)
  // radix hides an item-aligned menu when the value matches no item, so fall back to a rendered one
  const value = isListed
    ? serviceFieldId
    : serviceFieldId === SprintPokerDefaults.SERVICE_FIELD_NULL
      ? SERVICE_FIELD_NULL_VALUE
      : SprintPokerDefaults.SERVICE_FIELD_COMMENT

  const handleValueChange = (nextValue: string) => {
    if (nextValue === MISSING_FIELD) {
      onOpenHelp()
      return
    }
    const fieldId = fromSelectValue(nextValue)
    const label =
      options.find((option) => option.fieldId === fieldId)?.label ??
      SENTINEL_LABELS[fieldId] ??
      fieldId
    onSelectField(fieldId, label)
  }

  return (
    <Select value={value} onValueChange={handleValueChange} onOpenChange={onOpenChange}>
      <SelectTrigger asChild>{trigger}</SelectTrigger>
      <SelectContent>
        {hasEmptyFieldList && (
          <div className='px-4 py-2 text-fg-secondary text-sm'>No fields found</div>
        )}
        {options.map(({fieldId, label}) => (
          <SelectItem key={fieldId} value={fieldId}>
            {label}
          </SelectItem>
        ))}
        {options.length > 0 && <SelectSeparator />}
        <SelectItem value={SprintPokerDefaults.SERVICE_FIELD_COMMENT}>
          {SprintPokerDefaults.SERVICE_FIELD_COMMENT_LABEL}
        </SelectItem>
        <SelectItem value={SERVICE_FIELD_NULL_VALUE}>
          {SprintPokerDefaults.SERVICE_FIELD_NULL_LABEL}
        </SelectItem>
        {helpUrl && (
          <SelectItem
            value={MISSING_FIELD}
            className='italic'
            endAdornment={<OpenInNew className='h-[18px] w-[18px] text-fg-muted' />}
          >
            Where's my field?
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}

export default EstimateFieldSelect
