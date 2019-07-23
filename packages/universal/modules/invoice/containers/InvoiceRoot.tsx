import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps} from 'react-router'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import Invoice from 'universal/modules/invoice/components/Invoice/Invoice'
import {LoaderSize} from 'universal/types/constEnums'
import renderQuery from 'universal/utils/relay/renderQuery'
import useAtmosphere from '../../../hooks/useAtmosphere'

const query = graphql`
  query InvoiceRootQuery($invoiceId: ID!) {
    viewer {
      ...Invoice_viewer
    }
  }
`

interface Props extends RouteComponentProps<{invoiceId: string}> {}

const InvoiceRoot = ({
  match: {
    params: {invoiceId}
  }
}: Props) => {
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{invoiceId}}
      render={renderQuery(Invoice, {size: LoaderSize.WHOLE_PAGE})}
    />
  )
}

export default InvoiceRoot
