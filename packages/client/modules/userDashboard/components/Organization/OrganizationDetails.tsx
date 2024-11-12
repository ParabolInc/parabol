import styled from '@emotion/styled'
import {TierEnum} from '../../../../__generated__/DowngradeToStarterMutation.graphql'
import TagBlock from '../../../../components/Tag/TagBlock'
import TierTag from '../../../../components/Tag/TierTag'
import makeDateString from '../../../../utils/makeDateString'

const StyledTagBlock = styled(TagBlock)({
  display: 'block'
})

const OrgDetails = styled('div')({
  alignItems: 'flex-start',
  display: 'flex',
  flexShrink: 0,
  fontSize: 13,
  lineHeight: '20px'
})

interface Props {
  createdAt: string
  tier: TierEnum
  billingTier: TierEnum
}

const OrganizationDetails = (props: Props) => {
  const {createdAt, tier, billingTier} = props
  return (
    <OrgDetails>
      {'Created '}
      {makeDateString(createdAt)}
      {tier !== 'starter' && (
        <StyledTagBlock>
          <TierTag tier={tier} billingTier={billingTier} />
        </StyledTagBlock>
      )}
    </OrgDetails>
  )
}

export default OrganizationDetails
