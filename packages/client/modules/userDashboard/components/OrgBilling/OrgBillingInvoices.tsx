import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createPaginationContainer, RelayPaginationProp} from 'react-relay'
import {OrgBillingInvoices_viewer} from '~/__generated__/OrgBillingInvoices_viewer.graphql'
import Panel from '../../../../components/Panel/Panel'
import SecondaryButton from '../../../../components/SecondaryButton'
import {Layout} from '../../../../types/constEnums'
import InvoiceRow from '../InvoiceRow/InvoiceRow'

const MoreGutter = styled('div')({
  paddingBottom: Layout.ROW_GUTTER
})

const LoadMoreButton = styled(SecondaryButton)({
  margin: '0 auto'
})

interface Props {
  viewer: OrgBillingInvoices_viewer
  relay: RelayPaginationProp
}

const OrgBillingInvoices = (props: Props) => {
  const {relay, viewer} = props
  const {invoices} = viewer
  const {hasMore, isLoading, loadMore} = relay
  const loadNext = () => {
    if (!hasMore() || isLoading()) return
    // @ts-ignore
    loadMore(5)
  }
  if (!invoices || !invoices.edges.length) return null
  return (
    <Panel label='Invoices'>
      <div>
        {invoices.edges.map(({node: invoice}) => (
          <InvoiceRow key={`invoiceRow${invoice.id}`} invoice={invoice} />
        ))}
        {hasMore() && (
          <MoreGutter>
            <LoadMoreButton onClick={loadNext}>{'Load More'}</LoadMoreButton>
          </MoreGutter>
        )}
      </div>
    </Panel>
  )
}

export default createPaginationContainer(
  OrgBillingInvoices,
  {
    viewer: graphql`
      fragment OrgBillingInvoices_viewer on User {
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
    `
  },
  {
    direction: 'forward',
    // @ts-ignore
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.invoices
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      }
    },
    getVariables(_props, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: count,
        after: cursor
      }
    },
    query: graphql`
      query OrgBillingInvoicesPaginationQuery($first: Int!, $after: DateTime, $orgId: ID!) {
        viewer {
          ...OrgBillingInvoices_viewer
        }
      }
    `
  }
)
