import {useId} from 'react'
import {Checkbox} from '../ui/Checkbox/Checkbox'

interface Props {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

const MeetingTemplateSeriesOption = ({checked, onCheckedChange}: Props) => {
  const id = useId()
  return (
    <div className='flex items-start gap-2.5 rounded-lg bg-surface-app px-3 py-2.5'>
      <Checkbox
        id={id}
        className='mt-0.5 shrink-0'
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <label htmlFor={id} className='flex cursor-pointer flex-col'>
        <span className='font-semibold text-fg-primary text-sm'>
          Use for future meetings in this series
        </span>
        <span className='text-fg-secondary text-xs'>
          {checked
            ? 'Meetings that have already started keep their template.'
            : 'Off: only this meeting changes.'}
        </span>
      </label>
    </div>
  )
}

export default MeetingTemplateSeriesOption
