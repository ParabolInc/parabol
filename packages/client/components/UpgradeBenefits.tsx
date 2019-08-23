import React from 'react'
import styled from '@emotion/styled'
import ui from '../styles/ui'
import Icon from './Icon'
import {MD_ICONS_SIZE_18} from '../styles/icons'

const StyledIcon = styled(Icon)({
  color: ui.palette.green,
  fontSize: MD_ICONS_SIZE_18,
  marginRight: '.5rem',
  opacity: 1
})

const ModalCopy = styled('p')({
  alignItems: 'center',
  display: 'flex',
  fontSize: '.9375rem',
  lineHeight: '2rem',
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
