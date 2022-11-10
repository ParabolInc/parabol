import styled from '@emotion/styled'
import {CheckCircle} from '@mui/icons-material'
import React from 'react'
import {PALETTE} from '../styles/paletteV3'

const StyledIcon = styled(CheckCircle)({
  color: PALETTE.JADE_400,
  height: 18,
  width: 18,
  marginRight: 8,
  opacity: 1
})

const ModalCopy = styled('p')({
  alignItems: 'center',
  justifyContent: 'flex-start',
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
            <StyledIcon />
            {benefit}
          </ModalCopy>
        )
      })}
    </BenefitsList>
  )
}

export default UpgradeBenefits
