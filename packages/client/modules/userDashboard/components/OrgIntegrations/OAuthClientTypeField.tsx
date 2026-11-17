import {Key as KeyIcon, Public as PublicIcon} from '~/ui/icons'
import {cn} from '../../../../ui/cn'
import {RadioGroup, RadioGroupItem} from '../../../../ui/RadioGroup/RadioGroup'

export type OAuthClientType = 'CONFIDENTIAL' | 'PUBLIC'

interface Props {
  value: OAuthClientType
  onChange: (value: OAuthClientType) => void
  disabled?: boolean
}

const OPTIONS = [
  {
    value: 'CONFIDENTIAL',
    label: 'Confidential',
    Icon: KeyIcon,
    description:
      'Runs on a server that can keep a secret. Signs in with a client ID and client secret.'
  },
  {
    value: 'PUBLIC',
    label: 'Public',
    Icon: PublicIcon,
    description:
      'A desktop, command-line or browser app that can’t keep a secret. Signs in with PKCE instead.'
  }
] as const

const OAuthClientTypeField = ({value, onChange, disabled}: Props) => {
  return (
    <div className='flex flex-col space-y-1'>
      <span
        id='oauth-client-type-label'
        className='font-semibold text-fg-muted text-xs uppercase tracking-wider'
      >
        Client type
      </span>
      <RadioGroup
        aria-labelledby='oauth-client-type-label'
        value={value}
        onValueChange={(next) => {
          if (next === 'CONFIDENTIAL' || next === 'PUBLIC') onChange(next)
        }}
        disabled={disabled}
        className='grid grid-cols-2 gap-3'
      >
        {OPTIONS.map(({value: optionValue, label, Icon, description}) => (
          <label
            key={optionValue}
            htmlFor={`oauth-client-type-${optionValue}`}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border p-3',
              value === optionValue
                ? 'border-accent bg-accent/10'
                : 'border-hairline bg-surface-card hover:bg-surface-hover',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <RadioGroupItem
              id={`oauth-client-type-${optionValue}`}
              value={optionValue}
              className='mt-0.5 shrink-0'
            />
            <span className='flex flex-col gap-1'>
              <span className='flex items-center gap-1.5 font-semibold text-fg-primary text-sm'>
                <Icon className='text-[18px]' />
                {label}
              </span>
              <span className='text-fg-secondary text-xs'>{description}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}

export default OAuthClientTypeField
