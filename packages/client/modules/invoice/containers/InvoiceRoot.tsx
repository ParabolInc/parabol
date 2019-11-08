import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps} from 'react-router'
import {QueryRenderer} from 'react-relay'
import Invoice from '../components/Invoice/Invoice'
import {LoaderSize} from '../../../types/constEnums'
import renderQuery from '../../../utils/relay/renderQuery'
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
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(Invoice, {size: LoaderSize.WHOLE_PAGE})}
    />
  )
}

export default InvoiceRoot
