import styled from '@emotion/styled'
import {TierEnum} from '../../__generated__/OrganizationSubscription.graphql'
import {PALETTE} from '../../styles/paletteV3'
import {TierLabel} from '../../types/constEnums'
import BaseTag from './BaseTag'

interface Props {
  className?: string
  tier: TierEnum | null
  billingTier: TierEnum | null
}

const StarterTag = styled(BaseTag)({
  backgroundColor: PALETTE.SLATE_200,
  color: PALETTE.SLATE_700
})

const TeamTag = styled(BaseTag)({
  backgroundColor: PALETTE.GOLD_300,
  color: PALETTE.GRAPE_700
})

const EnterpriseTag = styled(BaseTag)({
  backgroundColor: PALETTE.SKY_500,
  color: '#FFFFFF'
})

const TierTag = (props: Props) => {
  const {className, tier, billingTier} = props
  if (tier !== billingTier) return <StarterTag className={className}>{'Free Trial'}</StarterTag>
  if (tier === 'starter') return <StarterTag className={className}>{TierLabel.STARTER}</StarterTag>
  if (tier === 'team') return <TeamTag className={className}>{TierLabel.TEAM}</TeamTag>
  if (tier === 'enterprise')
    return <EnterpriseTag className={className}>{TierLabel.ENTERPRISE}</EnterpriseTag>
  return null
}
export default TierTag
