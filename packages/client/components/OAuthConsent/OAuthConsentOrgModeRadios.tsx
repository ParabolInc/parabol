import {cn} from '../../ui/cn'
import {RadioGroup, RadioGroupItem} from '../../ui/RadioGroup/RadioGroup'
import type {OAuthConsentOrgMode} from './useOAuthConsentChoice'

const MAX_NAMED_ORGS = 3

const describeAllOrgs = (appName: string, allowedOrgNames: readonly string[]) => {
  if (allowedOrgNames.length > MAX_NAMED_ORGS) {
    return `Every organization that allows ${appName}, plus any organization you join later`
  }
  const leading = allowedOrgNames.slice(0, -1).join(', ')
  const last = allowedOrgNames.at(-1)
  return `${leading ? `${leading} and ${last}` : last}, plus any organization you join later`
}

interface Props {
  appName: string
  allowedOrgNames: readonly string[]
  orgMode: OAuthConsentOrgMode
  onOrgModeChange: (orgMode: OAuthConsentOrgMode) => void
}

const OAuthConsentOrgModeRadios = ({appName, allowedOrgNames, orgMode, onOrgModeChange}: Props) => {
  const options = [
    {
      value: 'all',
      title: 'All my organizations',
      description: describeAllOrgs(appName, allowedOrgNames)
    },
    {
      value: 'pick',
      title: 'Only the ones I choose',
      description: 'New organizations stay out until you add them'
    }
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
            <span className='wrap-anywhere mt-px block text-[13px] text-fg-secondary leading-[18px]'>
              {description}
            </span>
          </span>
        </label>
      ))}
    </RadioGroup>
  )
}

export default OAuthConsentOrgModeRadios
