import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../../styles/paletteV3'
import {TierLabel} from '../../types/constEnums'
import {TierEnum} from '../../__generated__/NewMeetingQuery.graphql'
import BaseTag from './BaseTag'

interface Props {
  className?: string
  tier: TierEnum | null
}

const PersonalTag = styled(BaseTag)({
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
  const {className, tier} = props
  if (tier === 'starter')
    return <PersonalTag className={className}>{TierLabel.STARTER}</PersonalTag>
  if (tier === 'team') return <TeamTag className={className}>{TierLabel.TEAM}</TeamTag>
  if (tier === 'enterprise')
    return <EnterpriseTag className={className}>{TierLabel.ENTERPRISE}</EnterpriseTag>
  return null
}
export default TierTag
