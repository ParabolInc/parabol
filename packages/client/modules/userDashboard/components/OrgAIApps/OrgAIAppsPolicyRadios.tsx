import type {OrgAIAppsPolicyEnum} from '../../../../__generated__/OrgAIAppsPolicyPanel_organization.graphql'
import BaseTag from '../../../../components/Tag/BaseTag'
import {Link as LinkIcon} from '../../../../ui/icons'
import {RadioGroup, RadioGroupItem} from '../../../../ui/RadioGroup/RadioGroup'

const OPTIONS = [
  {value: 'ALL', label: 'All apps', description: 'Verified or not'},
  {
    value: 'VERIFIED',
    label: 'Verified apps',
    description: 'Only apps Parabol has verified, like Claude and ChatGPT'
  },
  {value: 'NONE', label: 'No apps', description: 'Existing connections stop working'}
] as const

interface Props {
  labelId: string
  value: OrgAIAppsPolicyEnum
  isFollowing: boolean
  onChange: (policy: OrgAIAppsPolicyEnum) => void
}

const OrgAIAppsPolicyRadios = ({labelId, value, isFollowing, onChange}: Props) => (
  <RadioGroup
    aria-labelledby={labelId}
    value={value}
    onValueChange={(next) => {
      const option = OPTIONS.find((option) => option.value === next)
      if (option) onChange(option.value)
    }}
    className='flex flex-col gap-3'
  >
    {OPTIONS.map(({value: optionValue, label, description}) => (
      <label key={optionValue} className='flex cursor-pointer items-start gap-3 text-sm'>
        <RadioGroupItem value={optionValue} className='mt-0.5 shrink-0' />
        <span className='flex flex-col'>
          <span className='flex flex-wrap items-center gap-2 font-semibold text-fg-primary'>
            {label}
            {isFollowing && optionValue === value && (
              <BaseTag className='ml-0 inline-flex items-center gap-1 bg-slate-600 text-white'>
                <LinkIcon className='text-[14px]' />
                Following AI Features
              </BaseTag>
            )}
          </span>
          <span className='text-fg-secondary'>{description}</span>
        </span>
      </label>
    ))}
  </RadioGroup>
)

export default OrgAIAppsPolicyRadios
