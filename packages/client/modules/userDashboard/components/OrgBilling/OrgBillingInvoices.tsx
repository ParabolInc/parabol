import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {usePaginationFragment} from 'react-relay'
import {OrgBillingInvoices_viewer$key} from '~/__generated__/OrgBillingInvoices_viewer.graphql'
import Panel from '../../../../components/Panel/Panel'
import SecondaryButton from '../../../../components/SecondaryButton'
import {Layout} from '../../../../types/constEnums'
import {OrgBillingInvoicesPaginationQuery} from '../../../../__generated__/OrgBillingInvoicesPaginationQuery.graphql'
import InvoiceRow from '../InvoiceRow/InvoiceRow'

const MoreGutter = styled('div')({
  paddingBottom: Layout.ROW_GUTTER
})

const LoadMoreButton = styled(SecondaryButton)({
  margin: '0 auto'
})

interface Props {
  viewerRef: OrgBillingInvoices_viewer$key
}

const OrgBillingInvoices = (props: Props) => {
  const {viewerRef} = props
  const paginationRes = usePaginationFragment<
    OrgBillingInvoicesPaginationQuery,
    OrgBillingInvoices_viewer$key
  >(
    graphql`
      fragment OrgBillingInvoices_viewer on Query
      @refetchable(queryName: "OrgBillingInvoicesPaginationQuery") {
        viewer {
          invoices(first: $first, orgId: $orgId, after: $after)
            @connection(key: "OrgBilling_invoices") {
            edges {
              cursor
              node {
                ...InvoiceRow_invoice
                id
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    `,
    viewerRef
  )
  const {data, hasNext, isLoadingNext, loadNext} = paginationRes
  const {viewer} = data
  const {invoices} = viewer
  const loadMore = () => {
    if (!hasNext || isLoadingNext) return
    loadNext(5)
  }
  if (!invoices || !invoices.edges.length) return null
  return (
    <Panel label='Invoices'>
      <div>
        {invoices.edges.map(({node: invoice}) => (
          <InvoiceRow key={`invoiceRow${invoice.id}`} invoice={invoice} />
        ))}
        {hasNext && (
          <MoreGutter>
            <LoadMoreButton onClick={loadMore}>{'Load More'}</LoadMoreButton>
          </MoreGutter>
        )}
      </div>
    </Panel>
  )
}

export default OrgBillingInvoices
