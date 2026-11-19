import type {OrgAIAppsPolicyEnum} from '../../../../__generated__/OrgAIAppsPolicyPanel_organization.graphql'
import BaseTag from '../../../../components/Tag/BaseTag'
import {cn} from '../../../../ui/cn'
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
  disabled: boolean
  onChange: (policy: OrgAIAppsPolicyEnum) => void
}

const OrgAIAppsPolicyRadios = ({labelId, value, isFollowing, disabled, onChange}: Props) => (
  <RadioGroup
    aria-labelledby={labelId}
    value={value}
    onValueChange={(next) => {
      const option = OPTIONS.find((option) => option.value === next)
      if (option) onChange(option.value)
    }}
    disabled={disabled}
    className='flex flex-col gap-3'
  >
    {OPTIONS.map(({value: optionValue, label, description}) => {
      const isFollowedChoice = isFollowing && optionValue === value
      return (
        <label
          key={optionValue}
          className={cn(
            'flex cursor-pointer items-start gap-3 text-sm',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <RadioGroupItem
            value={optionValue}
            onClick={isFollowedChoice ? () => onChange(optionValue) : undefined}
            className='mt-0.5 shrink-0'
          />
          <span className='flex flex-col'>
            <span className='flex flex-wrap items-center gap-2 font-semibold text-fg-primary'>
              {label}
              {isFollowedChoice && (
                <BaseTag className='ml-0 inline-flex items-center gap-1 bg-slate-600 text-white'>
                  <LinkIcon className='text-[14px]' />
                  Following AI Features
                </BaseTag>
              )}
            </span>
            <span className='text-fg-secondary'>{description}</span>
          </span>
        </label>
      )
    })}
  </RadioGroup>
)

export default OrgAIAppsPolicyRadios
