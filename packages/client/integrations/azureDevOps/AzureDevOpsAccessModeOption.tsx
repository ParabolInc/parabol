import {RadioGroupItem} from '../../ui/RadioGroup/RadioGroup'

interface Props {
  value: string
  label: string
  description: string
}

const AzureDevOpsAccessModeOption = (props: Props) => {
  const {value, label, description} = props
  return (
    <label className='flex cursor-pointer items-start gap-3 text-sm'>
      <RadioGroupItem value={value} className='mt-0.5 shrink-0' />
      <span className='flex flex-col'>
        <span className='font-semibold text-fg-primary'>{label}</span>
        <span className='text-fg-secondary'>{description}</span>
      </span>
    </label>
  )
}

export default AzureDevOpsAccessModeOption
