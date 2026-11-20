import {cn} from '../../../../ui/cn'
import {RadioGroup, RadioGroupItem} from '../../../../ui/RadioGroup/RadioGroup'

export type OAuthClientType = 'CONFIDENTIAL' | 'PUBLIC'

export const CLIENT_TYPE_LABELS = {
  CONFIDENTIAL: 'Confidential (has secret)',
  PUBLIC: 'Public (PKCE)'
} as const satisfies Record<OAuthClientType, string>

interface Props {
  value: OAuthClientType
  onChange: (value: OAuthClientType) => void
  disabled?: boolean
}

const OPTIONS = [
  {
    value: 'CONFIDENTIAL',
    label: CLIENT_TYPE_LABELS.CONFIDENTIAL,
    description:
      'For an app on a server that can keep a secret. Signs in with a client ID and client secret.'
  },
  {
    value: 'PUBLIC',
    label: CLIENT_TYPE_LABELS.PUBLIC,
    description:
      'For a desktop, command-line or browser app that can’t keep a secret. Signs in with a PKCE code challenge instead.'
  }
] as const

const OAuthClientTypeField = ({value, onChange, disabled}: Props) => {
  return (
    <div className='flex flex-col space-y-1'>
      <span
        id='oauth-client-type-label'
        className='font-semibold text-fg-muted text-xs uppercase tracking-wider'
      >
        Client authentication
      </span>
      <RadioGroup
        aria-labelledby='oauth-client-type-label'
        value={value}
        onValueChange={(next) => {
          if (next === 'CONFIDENTIAL' || next === 'PUBLIC') onChange(next)
        }}
        disabled={disabled}
        className='flex flex-col gap-3'
      >
        {OPTIONS.map(({value: optionValue, label, description}) => (
          <label
            key={optionValue}
            htmlFor={`oauth-client-type-${optionValue}`}
            className={cn(
              'flex cursor-pointer items-start gap-3 text-sm',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <RadioGroupItem
              id={`oauth-client-type-${optionValue}`}
              value={optionValue}
              className='mt-0.5 shrink-0'
            />
            <span className='flex flex-col'>
              <span className='font-semibold text-fg-primary'>{label}</span>
              <span className='text-fg-secondary'>{description}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}

export default OAuthClientTypeField
