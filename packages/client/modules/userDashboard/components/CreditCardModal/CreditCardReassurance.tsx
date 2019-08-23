import React from 'react'
import {CreditCardModalActionType} from './CreditCardModal'
import OrgBillingReassuranceQuote from '../OrgBilling/OrgBillingReassuranceQuote'
import styled from '@emotion/styled'
import MenuItemHR from '../../../../components/MenuItemHR'

const Quote = styled(OrgBillingReassuranceQuote)({
  padding: '12px 24px 16px'
})

const HR = styled(MenuItemHR)({
  width: '100%'
})

interface Props {
  actionType: CreditCardModalActionType
}

const CreditCardReassurance = (props: Props) => {
  const {actionType} = props
  if (actionType !== 'squeeze') return null

  return (
    <>
      <Quote />
      <HR />
    </>
  )
}

export default CreditCardReassurance
