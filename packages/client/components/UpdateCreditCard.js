import React from 'react'
import styled from '@emotion/styled'
import ui from '../styles/ui'
import UpgradeCreditCardForm from '../modules/userDashboard/components/CreditCardModal/UpgradeCreditCardForm'

const flexBase = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
}

const ModalBoundary = styled('div')({
  ...flexBase,
  background: ui.palette.white,
  borderRadius: ui.modalBorderRadius
})

const ModalActionPanel = styled('div')({
  ...flexBase,
  backgroundColor: ui.backgroundColor,
  borderRadius: ui.modalBorderRadius,
  height: '100%',
  padding: '1.25rem',
  width: '20rem'
})

const UpdateCreditCard = (props) => {
  const {closePortal, orgId} = props
  return (
    <ModalBoundary>
      <ModalActionPanel>
        <UpgradeCreditCardForm isUpdate orgId={orgId} onSuccess={closePortal} />
      </ModalActionPanel>
    </ModalBoundary>
  )
}

export default UpdateCreditCard
