import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {NextPeriodChargesLineItem_item$key} from '~/__generated__/NextPeriodChargesLineItem_item.graphql'
import {TierEnum} from '~/__generated__/StandardHub_viewer.graphql'
import plural from '../../../../utils/plural'
import invoiceLineFormat from '../../helpers/invoiceLineFormat'
import InvoiceLineItemContent from './InvoiceLineItemContent'

interface Props {
  item: NextPeriodChargesLineItem_item$key
  tier: TierEnum
}

const NextPeriodChargesLineItem = (props: Props) => {
  const {item: itemRef, tier} = props
  const item = useFragment(
    graphql`
      fragment NextPeriodChargesLineItem_item on NextPeriodCharges {
        amount
        quantity
        unitPrice
      }
    `,
    itemRef
  )
  const {unitPrice, quantity} = item
  const amount = invoiceLineFormat(item.amount)
  if (tier === 'enterprise') {
    return (
      <InvoiceLineItemContent description={`${quantity} Enterprise Licenses`} amount={amount} />
    )
  }
  const unitPriceString = (unitPrice! / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  })
  const description = `${quantity} active ${plural(quantity, 'user')} (${unitPriceString} each)`
  return <InvoiceLineItemContent description={description} amount={amount} />
}

export default NextPeriodChargesLineItem
