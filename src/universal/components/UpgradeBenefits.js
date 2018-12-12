import React from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

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

const benefits = [
  'Unlimited Teams',
  'Direct Support Channel (Slack, etc.)',
  '24-Hour Support Window'
]

const UpgradeBenefits = () => {
  return benefits.map((benefit, idx) => {
    return (
      <ModalCopy key={`modalBulletCopy-${idx + 1}`}>
        <StyledIcon>check_circle</StyledIcon>
        {benefit}
      </ModalCopy>
    )
  })
}

export default UpgradeBenefits
