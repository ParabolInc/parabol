import {Checkbox} from '../../ui/Checkbox/Checkbox'
import {AccountCircle} from '../../ui/icons'

interface Props {
  isIncluded: boolean
  onIncludedChange: (isIncluded: boolean) => void
}

const OAuthConsentPrivateRow = ({isIncluded, onIncludedChange}: Props) => (
  <label className='flex cursor-pointer items-start gap-2.5 border-hairline border-t pt-2'>
    <Checkbox
      checked={isIncluded}
      onCheckedChange={(checked) => onIncludedChange(checked === true)}
      className='mt-0.5 shrink-0'
    />
    <span
      aria-hidden='true'
      className='flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-well text-fg-secondary'
    >
      <AccountCircle className='text-base' />
    </span>
    <span className='min-w-0 flex-1 font-semibold text-sm leading-5'>
      My private pages, invitations and notifications
    </span>
  </label>
)

export default OAuthConsentPrivateRow
