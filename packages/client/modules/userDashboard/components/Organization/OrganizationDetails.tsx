import type {TierEnum} from '../../../../__generated__/DowngradeToStarterMutation.graphql'
import TagBlock from '../../../../components/Tag/TagBlock'
import TierTag from '../../../../components/Tag/TierTag'
import makeDateString from '../../../../utils/makeDateString'

interface Props {
  createdAt: string
  tier: TierEnum
  billingTier: TierEnum
}

const OrganizationDetails = (props: Props) => {
  const {createdAt, tier, billingTier} = props
  return (
    <div className='flex shrink-0 items-start text-[13px] leading-[20px]'>
      {'Created '}
      {makeDateString(createdAt)}
      {tier !== 'starter' && (
        <TagBlock className='block'>
          <TierTag tier={tier} billingTier={billingTier} />
        </TagBlock>
      )}
    </div>
  )
}

export default OrganizationDetails
