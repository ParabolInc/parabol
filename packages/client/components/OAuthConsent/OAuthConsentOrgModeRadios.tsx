import {cn} from '../../ui/cn'
import {RadioGroup, RadioGroupItem} from '../../ui/RadioGroup/RadioGroup'
import type {OAuthConsentOrgMode} from './useOAuthConsentChoice'

interface Props {
  orgMode: OAuthConsentOrgMode
  onOrgModeChange: (orgMode: OAuthConsentOrgMode) => void
}

const OAuthConsentOrgModeRadios = ({orgMode, onOrgModeChange}: Props) => {
  const options = [
    {value: 'all', title: 'All my organizations', description: 'Including ones I join later'},
    {value: 'pick', title: 'Only the ones I choose', description: null}
  ] as const
  return (
    <RadioGroup
      value={orgMode}
      onValueChange={(value) => onOrgModeChange(value === 'pick' ? 'pick' : 'all')}
      aria-labelledby='oauth-consent-orgs'
    >
      {options.map(({value, title, description}) => (
        <label
          key={value}
          className={cn(
            'flex cursor-pointer items-start gap-2.5 rounded-lg border',
            orgMode === value
              ? 'border-2 border-accent px-[11px] py-[9px]'
              : 'border-hairline-strong px-3 py-2.5'
          )}
        >
          <RadioGroupItem value={value} className='mt-0.5 shrink-0' />
          <span>
            <span className='block font-semibold'>{title}</span>
            {description && (
              <span className='mt-px block text-[13px] text-fg-secondary leading-[18px]'>
                {description}
              </span>
            )}
          </span>
        </label>
      ))}
    </RadioGroup>
  )
}

export default OAuthConsentOrgModeRadios
