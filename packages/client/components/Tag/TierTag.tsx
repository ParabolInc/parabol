import React from 'react'
import {TierLabel} from '../../types/constEnums'
import {TierEnum} from '../../__generated__/NewMeeting_viewer.graphql'
import styled from '@emotion/styled'
import {PALETTE} from '../../styles/paletteV2'
import BaseTag from './BaseTag'

interface Props {
  className?: string
  tier: TierEnum | null
}

const PersonalTag = styled(BaseTag)({
  backgroundColor: PALETTE.BACKGROUND_MAIN,
  color: PALETTE.TEXT_MAIN
})

const ProTag = styled(BaseTag)({
  backgroundColor: PALETTE.BACKGROUND_YELLOW,
  color: PALETTE.TEXT_PURPLE
})

const EnterpriseTag = styled(BaseTag)({
  backgroundColor: PALETTE.BACKGROUND_BLUE,
  color: '#FFFFFF'
})

const TierTag = (props: Props) => {
  const {className, tier} = props
  if (tier === 'personal')
    return <PersonalTag className={className}>{TierLabel.PERSONAL}</PersonalTag>
  if (tier === 'pro') return <ProTag className={className}>{TierLabel.PRO}</ProTag>
  if (tier === 'enterprise')
    return <EnterpriseTag className={className}>{TierLabel.ENTERPRISE}</EnterpriseTag>
  return null
}
export default TierTag
