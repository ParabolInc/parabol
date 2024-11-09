import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {usePaginationFragment} from 'react-relay'
import {OrgBillingInvoices_query$key} from '~/__generated__/OrgBillingInvoices_query.graphql'
import {OrgBillingInvoicesPaginationQuery} from '../../../../__generated__/OrgBillingInvoicesPaginationQuery.graphql'
import Panel from '../../../../components/Panel/Panel'
import {ElementWidth} from '../../../../types/constEnums'
import {Button} from '../../../../ui/Button/Button'
import InvoiceRow from '../InvoiceRow/InvoiceRow'

const StyledPanel = styled(Panel)<{isWide: boolean}>(({isWide}) => ({
  maxWidth: isWide ? ElementWidth.PANEL_WIDTH : 'inherit'
}))

interface Props {
  queryRef: OrgBillingInvoices_query$key
  isWide?: boolean
}

const OrgBillingInvoices = (props: Props) => {
  const {queryRef, isWide} = props
  const paginationRes = usePaginationFragment<
    OrgBillingInvoicesPaginationQuery,
    OrgBillingInvoices_query$key
  >(
    graphql`
      fragment OrgBillingInvoices_query on Query
      @refetchable(queryName: "OrgBillingInvoicesPaginationQuery") {
        viewer {
          invoices(first: $first, orgId: $orgId, after: $after)
            @connection(key: "OrgBilling_invoices") {
            edges {
              cursor
              node {
                ...InvoiceRow_invoice
                id
                payUrl
              }
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      }
    `,
    queryRef
  )
  const {data} = paginationRes
  const {viewer} = data
  const {invoices} = viewer
  const {edges} = invoices
  if (!edges.length) return null
  const portalUrl = edges[0]?.node.payUrl ?? ''
  return (
    <StyledPanel label='Invoices' isWide={!!isWide}>
      <div>
        {edges.map(({node: invoice}) => (
          <InvoiceRow key={`invoiceRow${invoice.id}`} invoice={invoice} />
        ))}
        <div className='flex justify-center pb-4'>
          <Button variant={'outline'} shape={'pill'}>
            <a href={portalUrl} rel='noopener noreferrer'>
              {'See All Invoices'}
            </a>
          </Button>
        </div>
      </div>
    </StyledPanel>
  )
}

export default OrgBillingInvoices
