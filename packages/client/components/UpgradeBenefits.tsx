import styled from '@emotion/styled'
import {CheckCircle} from '@mui/icons-material'
import React from 'react'
import {useTranslation} from 'react-i18next'
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
  const {t} = useTranslation()

  return (
    <BenefitsList>
      {benefits.map((benefit, idx) => {
        return (
          <ModalCopy
            key={t('UpgradeBenefits.ModalBulletCopyIdx1', {
              idx1: idx + 1
            })}
          >
            <StyledIcon />
            {benefit}
          </ModalCopy>
        )
      })}
    </BenefitsList>
  )
}

export default UpgradeBenefits
