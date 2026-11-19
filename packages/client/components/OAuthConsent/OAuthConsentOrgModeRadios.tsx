import {RadioGroup, RadioGroupItem} from '../../ui/RadioGroup/RadioGroup'
import type {OAuthConsentOrgMode} from './useOAuthConsentChoice'

const OPTIONS = [
  {value: 'all', label: 'All my organizations', description: 'Including ones I join later'},
  {value: 'pick', label: 'Only the ones I choose', description: null}
] as const

interface Props {
  orgMode: OAuthConsentOrgMode
  onOrgModeChange: (orgMode: OAuthConsentOrgMode) => void
}

const OAuthConsentOrgModeRadios = ({orgMode, onOrgModeChange}: Props) => (
  <RadioGroup
    value={orgMode}
    onValueChange={(value) => onOrgModeChange(value === 'pick' ? 'pick' : 'all')}
    aria-labelledby='oauth-consent-orgs'
    className='flex flex-col gap-3'
  >
    {OPTIONS.map(({value, label, description}) => (
      <label key={value} className='flex cursor-pointer items-start gap-3'>
        <RadioGroupItem value={value} className='mt-0.5 shrink-0' />
        <span className='flex flex-col'>
          <span className='font-semibold'>{label}</span>
          {description && <span className='text-fg-secondary'>{description}</span>}
        </span>
      </label>
    ))}
  </RadioGroup>
)

export default OAuthConsentOrgModeRadios
