import React from 'react'
import invoiceLineFormat from '../../helpers/invoiceLineFormat'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {NextMonthChargesLineItem_item} from '__generated__/NextMonthChargesLineItem_item.graphql'
import plural from '../../../../utils/plural'
import InvoiceLineItemContent from './InvoiceLineItemContent'

interface Props {
  item: NextMonthChargesLineItem_item
}

const NextMonthChargesLineItem = (props: Props) => {
  const {item} = props
  const {unitPrice, quantity} = item
  const amount = invoiceLineFormat(item.amount)
  const unitPriceString = (unitPrice / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  })
  const description = `${quantity} active ${plural(quantity, 'user')} (${unitPriceString} each)`
  return <InvoiceLineItemContent description={description} amount={amount}/>
}

export default createFragmentContainer(
  NextMonthChargesLineItem,
  {
    item: graphql`
      fragment NextMonthChargesLineItem_item on InvoiceChargeNextMonth {
        amount
        quantity
        unitPrice
      }
    `
  }
)
