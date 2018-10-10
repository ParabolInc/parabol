import React from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import Icon from 'universal/components/Icon'
import {MD_ICONS_SIZE_18} from 'universal/styles/icons'

const modalCopyBase = {
  fontSize: '.9375rem',
  lineHeight: '2rem',
  margin: 0
}

const StyledIcon = styled(Icon)({
  color: ui.linkColor,
  fontSize: MD_ICONS_SIZE_18,
  marginRight: '.5rem',
  opacity: 0.5
})

const BulletIcon = styled(StyledIcon)({
  color: ui.palette.green,
  opacity: 1
})

const ModalCopy = styled('p')({...modalCopyBase})

const benefits = [
  'Run Unlimited Retrospective Meetings',
  'Customize Social Check-In Rounds',
  'Access an Unlimited Archive'
]

const UpgradeBenefits = () => {
  return benefits.map((benefit, idx) => {
    return (
      <ModalCopy key={`modalBulletCopy-${idx + 1}`}>
        <BulletIcon>check_circle</BulletIcon>
        {benefit}
      </ModalCopy>
    )
  })
}

export default UpgradeBenefits
