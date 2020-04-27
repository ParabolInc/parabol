import InvoiceLineItem from './InvoiceLineItem'
import {InvoiceLineItemEnum} from 'parabol-client/types/graphql'

interface Input {
  amount: number
  description?: string | null
  quantity: number
}

export default class InvoiceLineItemOtherAdjustments extends InvoiceLineItem {
  details = []
  type = InvoiceLineItemEnum.OTHER_ADJUSTMENTS
  constructor(input: Input) {
    super({...input, type: InvoiceLineItemEnum.OTHER_ADJUSTMENTS})
  }
}
