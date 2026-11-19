import {Checkbox} from '../../ui/Checkbox/Checkbox'

interface Props {
  isIncluded: boolean
  onIncludedChange: (isIncluded: boolean) => void
}

const OAuthConsentPrivateRow = ({isIncluded, onIncludedChange}: Props) => (
  <label className='flex cursor-pointer select-none items-center gap-2'>
    <Checkbox
      checked={isIncluded}
      onCheckedChange={(checked) => onIncludedChange(checked === true)}
    />
    <span className='font-medium'>My private pages, invitations and notifications</span>
  </label>
)

export default OAuthConsentPrivateRow
