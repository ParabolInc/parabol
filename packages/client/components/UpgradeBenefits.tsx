import styled from '@emotion/styled'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import Icon from './Icon'

const StyledIcon = styled(Icon)({
  color: PALETTE.JADE_400,
  fontSize: ICON_SIZE.MD18,
  marginRight: 8,
  opacity: 1
})

const ModalCopy = styled('p')({
  alignItems: 'center',
  display: 'flex',
  fontSize: 15,
  lineHeight: '32px',
  margin: 0
})

const BenefitsList = styled('div')({
  display: 'flex',
  flexDirection: 'column'
})
const benefits = ['Unlimited Teams', 'Priority Customer Support', 'Monthly Active User Billing']

const UpgradeBenefits = () => {
  return (
    <BenefitsList>
      {benefits.map((benefit, idx) => {
        return (
          <ModalCopy key={`modalBulletCopy-${idx + 1}`}>
            <StyledIcon>check_circle</StyledIcon>
            {benefit}
          </ModalCopy>
        )
      })}
    </BenefitsList>
  )
}

export default UpgradeBenefits
