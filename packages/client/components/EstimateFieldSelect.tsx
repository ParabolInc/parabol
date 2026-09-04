import type {ReactNode} from 'react'
import {OpenInNew} from '~/ui/icons'
import {SprintPokerDefaults} from '../types/constEnums'
import {Select} from '../ui/Select/Select'
import {SelectContent} from '../ui/Select/SelectContent'
import {SelectItem} from '../ui/Select/SelectItem'
import {SelectSeparator} from '../ui/Select/SelectSeparator'
import {SelectTrigger} from '../ui/Select/SelectTrigger'
import {fromSelectValue, SERVICE_FIELD_NULL_VALUE} from '../utils/serviceFieldSelectValue'
import {
  type EstimateFieldOption,
  findEstimateFieldOption,
  SENTINEL_FIELD_LABELS
} from './estimateFieldOptions'

// picking this doesn't change the field, it opens the service's docs
const MISSING_FIELD = '__missingField'

interface Props {
  hasEmptyFieldList: boolean
  helpUrl: string | null | undefined
  onOpenChange: (isOpen: boolean) => void
  onOpenHelp: () => void
  onSelectField: (fieldId: string) => void
  options: readonly EstimateFieldOption[]
  serviceFieldName: string
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
    serviceFieldName,
    trigger
  } = props
  const selectedOption = findEstimateFieldOption(options, serviceFieldName)
  // radix hides an item-aligned menu when the value matches no item, so fall back to a rendered one
  const value = selectedOption
    ? selectedOption.fieldId
    : serviceFieldName === SprintPokerDefaults.SERVICE_FIELD_NULL
      ? SERVICE_FIELD_NULL_VALUE
      : SprintPokerDefaults.SERVICE_FIELD_COMMENT

  const handleValueChange = (nextValue: string) => {
    if (nextValue === MISSING_FIELD) {
      onOpenHelp()
      return
    }
    onSelectField(fromSelectValue(nextValue))
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
          {SENTINEL_FIELD_LABELS[SprintPokerDefaults.SERVICE_FIELD_COMMENT]}
        </SelectItem>
        <SelectItem value={SERVICE_FIELD_NULL_VALUE}>
          {SENTINEL_FIELD_LABELS[SprintPokerDefaults.SERVICE_FIELD_NULL]}
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
