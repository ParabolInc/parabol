import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {createFragmentContainer} from 'react-relay'
import {NextPeriodChargesLineItem_item} from '~/__generated__/NextPeriodChargesLineItem_item.graphql'
import {TierEnum} from '~/__generated__/StandardHub_viewer.graphql'
import plural from '../../../../utils/plural'
import invoiceLineFormat from '../../helpers/invoiceLineFormat'
import InvoiceLineItemContent from './InvoiceLineItemContent'

interface Props {
  item: NextPeriodChargesLineItem_item
  tier: TierEnum
}

const NextPeriodChargesLineItem = (props: Props) => {
  const {item, tier} = props

  const {t} = useTranslation()

  const {unitPrice, quantity} = item
  const amount = invoiceLineFormat(item.amount)
  if (tier === 'enterprise') {
    return (
      <InvoiceLineItemContent
        description={t('NextPeriodChargesLineItem.QuantityEnterpriseLicenses', {
          quantity
        })}
        amount={amount}
      />
    )
  }
  const unitPriceString = (unitPrice! / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  })
  const description = t(
    'NextPeriodChargesLineItem.QuantityActivePluralQuantityUserUnitPriceStringEach',
    {
      quantity,
      pluralQuantityUser: plural(quantity, 'user'),
      unitPriceString
    }
  )
  return <InvoiceLineItemContent description={description} amount={amount} />
}

export default createFragmentContainer(NextPeriodChargesLineItem, {
  item: graphql`
    fragment NextPeriodChargesLineItem_item on NextPeriodCharges {
      amount
      quantity
      unitPrice
    }
  `
})
