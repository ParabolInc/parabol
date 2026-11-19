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
    <span className='min-w-0 flex-1'>
      <span className='block font-semibold text-sm leading-5'>
        My private pages and invitations
      </span>
      <span className='mt-0.5 block text-[13px] text-fg-secondary leading-[18px]'>
        Pages you haven’t shared with a team or organization, plus your invitations and
        notifications. No organization’s admins control this.
      </span>
    </span>
  </label>
)

export default OAuthConsentPrivateRow
