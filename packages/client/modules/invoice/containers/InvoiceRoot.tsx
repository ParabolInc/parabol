import React, {Suspense} from 'react'
import {RouteComponentProps} from 'react-router'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import invoiceQuery, {InvoiceQuery} from '../../../__generated__/InvoiceQuery.graphql'
import Invoice from '../components/Invoice/Invoice'

interface Props extends RouteComponentProps<{invoiceId: string}> {}

const InvoiceRoot = ({
  match: {
    params: {invoiceId}
  }
}: Props) => {
  const queryRef = useQueryLoaderNow<InvoiceQuery>(invoiceQuery, {invoiceId})
  return <Suspense fallback={''}>{queryRef && <Invoice queryRef={queryRef} />}</Suspense>
}

export default InvoiceRoot
