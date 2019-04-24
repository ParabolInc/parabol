import React, {Component} from 'react'
import {createPaginationContainer, graphql, RelayPaginationProp} from 'react-relay'
import SecondaryButton from 'universal/components/SecondaryButton'
import Panel from 'universal/components/Panel/Panel'
import InvoiceRow from 'universal/modules/userDashboard/components/InvoiceRow/InvoiceRow'
import styled from 'react-emotion'
import LoadableModal from 'universal/components/LoadableModal'
import UpdateCreditCardLoadable from 'universal/components/UpdateCreditCardLoadable'
import Icon from 'universal/components/Icon'
import {ICON_SIZE} from 'universal/styles/typographyV2'
import {OrgBilling_viewer} from '__generated__/OrgBilling_viewer.graphql'
import {OrgBilling_organization} from '__generated__/OrgBilling_organization.graphql'
import {Layout} from 'universal/types/constEnums'
import {PALETTE} from 'universal/styles/paletteV2'

const panelCell = {
  borderTop: `1px solid ${PALETTE.BORDER.LIGHTER}`,
  padding: Layout.ROW_GUTTER
}

const CreditCardInfo = styled('div')({
  alignItems: 'center',
  color: PALETTE.TEXT.MAIN,
  display: 'flex',
  fontSize: 14,
  lineHeight: '20px'
})

const CreditCardIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  marginRight: 16
})

const EnvelopeIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18,
  marginLeft: 4
})

const CreditCardProvider = styled('span')({
  fontWeight: 600,
  marginRight: 8
})

const CreditCardNumber = styled('span')({
  marginRight: 32
})

const CreditCardExpiresLabel = styled('span')({
  fontWeight: 600,
  marginRight: 8
})

const InfoAndUpdate = styled('div')({
  ...panelCell,
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between'
})

const MoreGutter = styled('div')({
  paddingBottom: Layout.ROW_GUTTER
})

const LoadMoreButton = styled(SecondaryButton)({
  margin: '0 auto'
})

const PanelRow = styled('div')({
  ...panelCell,
  textAlign: 'center'
})

const Unsubscribe = styled('div')({
  alignItems: 'center',
  color: PALETTE.LINK.MAIN,
  display: 'flex',
  justifyContent: 'center',
  '& a': {
    alignItems: 'center',
    color: PALETTE.LINK.BLUE,
    display: 'flex',
    marginLeft: 8,
    '& > u': {
      textDecoration: 'none'
    },
    '&:hover > u, &:focus > u': {
      textDecoration: 'underline'
    }
  }
})

interface Props {
  viewer: OrgBilling_viewer
  organization: OrgBilling_organization
  relay: RelayPaginationProp
}

class OrgBilling extends Component<Props> {
  loadMore = () => {
    const {
      relay: {hasMore, isLoading, loadMore}
    } = this.props
    if (!hasMore() || isLoading()) return
    // @ts-ignore
    loadMore(5)
  }

  render () {
    const {
      organization,
      viewer: {invoices},
      relay: {hasMore}
    } = this.props
    if (!invoices) return null
    const hasInvoices = invoices.edges.length > 0
    const {creditCard, id: orgId} = organization
    const {brand = '???', last4 = '••••', expiry = '???'} = creditCard || {}
    return (
      <div>
        <Panel label='Credit Card Information'>
          <InfoAndUpdate>
            <CreditCardInfo>
              <CreditCardIcon>credit_card</CreditCardIcon>
              <CreditCardProvider>{brand || '???'}</CreditCardProvider>
              <CreditCardNumber>
                {'•••• •••• •••• '}
                {last4 || '••••'}
              </CreditCardNumber>
              <CreditCardExpiresLabel>{'Expires'}</CreditCardExpiresLabel>
              <span>{expiry || '??/??'}</span>
            </CreditCardInfo>
            <LoadableModal
              LoadableComponent={UpdateCreditCardLoadable}
              queryVars={{orgId}}
              toggle={<SecondaryButton>{'Update'}</SecondaryButton>}
            />
          </InfoAndUpdate>
        </Panel>
        <Panel label='Invoices'>
          <div>
            {hasInvoices &&
              invoices.edges.map(({node: invoice}) => (
                <InvoiceRow
                  key={`invoiceRow${invoice.id}`}
                  invoice={invoice}
                  hasCard={Boolean(creditCard)}
                />
              ))}
            {hasMore() && (
              <MoreGutter>
                <LoadMoreButton onClick={this.loadMore}>{'Load More'}</LoadMoreButton>
              </MoreGutter>
            )}
          </div>
        </Panel>
        <Panel label='Danger Zone'>
          <PanelRow>
            <Unsubscribe>
              <span>{'Need to cancel? It’s painless. '}</span>
              <a
                href='mailto:love@parabol.co?subject=Instant Unsubscribe from Pro'
                title='Instant Unsubscribe from Pro'
              >
                <u>{'Contact us'}</u>
                <EnvelopeIcon>email</EnvelopeIcon>
              </a>
            </Unsubscribe>
          </PanelRow>
        </Panel>
      </div>
    )
  }
}

export default createPaginationContainer(
  OrgBilling,
  graphql`
    fragment OrgBilling_organization on Organization {
      id
      creditCard {
        brand
        last4
        expiry
      }
    }
    fragment OrgBilling_viewer on User {
      invoices(first: $first, orgId: $orgId, after: $after)
        @connection(key: "OrgBilling_invoices") {
        edges {
          cursor
          node {
            id
            amountDue
            endAt
            paidAt
            startAt
            status
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
  {
    direction: 'forward',
    // @ts-ignore
    getConnectionFromProps (props) {
      return props.viewer && props.viewer.invoices
    },
    getFragmentVariables (prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      }
    },
    getVariables (_props, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: count,
        after: cursor
      }
    },
    query: graphql`
      query OrgBillingPaginationQuery($first: Int!, $after: DateTime, $orgId: ID!) {
        viewer {
          ...OrgBilling_viewer
        }
      }
    `
  }
)
