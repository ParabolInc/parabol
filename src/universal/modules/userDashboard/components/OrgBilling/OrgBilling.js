import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import {createPaginationContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import InvoiceRow from 'universal/modules/userDashboard/components/InvoiceRow/InvoiceRow';
import CreditCardModalContainer from 'universal/modules/userDashboard/containers/CreditCardModal/CreditCardModalContainer';
import OrgPlanSqueeze from 'universal/modules/userDashboard/components/OrgPlanSqueeze/OrgPlanSqueeze';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {PERSONAL} from 'universal/utils/constants';

class OrgBilling extends Component {
  static propTypes = {
    invoices: PropTypes.array,
    invoicesReady: PropTypes.bool,
    styles: PropTypes.object,
    org: PropTypes.object,
    relay: PropTypes.object.isRequired,
    viewer: PropTypes.object
  };

  loadMore = () => {
    const {relay: {hasMore, isLoading, loadMore}} = this.props;
    if (!hasMore() || isLoading()) return;
    loadMore(5);
  }

  render() {
    const {
      styles,
      org,
      viewer: {invoices},
      relay: {hasMore}
    } = this.props;
    const hasInvoices = invoices.edges.length > 0;
    const {orgUserCount: {activeUserCount}, creditCard = {}, id: orgId, tier} = org;
    const {brand = '???', last4 = '••••', expiry = '???'} = creditCard;
    const update = (<Button
      buttonSize="small"
      colorPalette="cool"
      label="Update"
    />);
    return (
      <div>
        {tier === PERSONAL ?
          <OrgPlanSqueeze activeUserCount={activeUserCount} orgId={orgId} /> :
          <div className={css(styles.paidSection)}>
            <Panel label="Credit Card Information">
              <div className={css(styles.infoAndUpdate)}>
                <div className={css(styles.creditCardInfo)}>
                  <FontAwesome className={css(styles.creditCardIcon)} name="credit-card" />
                  <span className={css(styles.creditCardProvider)}>{brand || '???'}</span>
                  <span className={css(styles.creditCardNumber)}>{'•••• •••• •••• '}{last4 || '••••'}</span>
                  <span className={css(styles.creditCardExpiresLabel)}>Expires</span>
                  <span className={css(styles.expiry)}>{expiry || '??/??'}</span>
                </div>
                <CreditCardModalContainer isUpdate orgId={orgId} toggle={update} />
              </div>
            </Panel>
            <Panel label="Invoices">
              <div className={css(styles.listOfInvoices)}>
                {hasInvoices &&
                invoices.edges.map(({node: invoice}) =>
                  <InvoiceRow key={`invoiceRow${invoice.id}`} invoice={invoice} hasCard={Boolean(creditCard.last4)} />
                )
                }
                {hasMore() &&
                <div className={css(styles.loadMore)}>
                  <Button
                    buttonSize="medium"
                    buttonStyle="flat"
                    colorPalette="cool"
                    label="Load More"
                    onClick={this.loadMore}
                  />
                </div>
                }
              </div>
            </Panel>
            <Panel label="Danger Zone">
              <div className={css(styles.panelRow)}>
                <div className={css(styles.unsubscribe)}>
                  <span>{'Need to cancel? It’s painless.'}</span>
                  <a href="mailto:love@parabol.co?subject=Instant Unsubscribe from Pro" title="Instant Unsubscribe from Pro">
                    {' Contact us '}
                    <FontAwesome name="envelope" />
                  </a>
                </div>
              </div>
            </Panel>
          </div>
        }
      </div>
    );
  }
}

const panelCell = {
  borderTop: `.0625rem solid ${ui.panelInnerBorderColor}`,
  padding: ui.panelGutter
};

const styleThunk = () => ({
  creditCardInfo: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s3,
    lineHeight: appTheme.typography.s5
  },

  creditCardIcon: {
    marginRight: '1rem'
  },

  creditCardProvider: {
    fontWeight: 700,
    marginRight: '.5rem'
  },

  creditCardNumber: {
    marginRight: '2rem'
  },

  creditCardExpiresLabel: {
    fontWeight: 700,
    marginRight: '.5rem'
  },

  infoAndUpdate: {
    ...panelCell,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between'
  },

  loadMore: {
    color: appTheme.palette.cool,
    display: 'flex',
    fontSize: '1.25rem',
    fontWeight: 700,
    justifyContent: 'center',
    textTransform: 'uppercase',
    paddingBottom: ui.panelGutter
  },

  noInvoices: {
    textAlign: 'center',
    margin: '1rem'
  },

  panelRow: {
    ...panelCell,
    textAlign: 'center'
  },
  unsubscribe: {
    fontWeight: 700,
    color: appTheme.palette.mid
  }
});

export default createPaginationContainer(
  withStyles(styleThunk)(OrgBilling),
  graphql`
    fragment OrgBilling_viewer on User {
      invoices(first: $first, orgId: $orgId, after: $after) @connection(key: "OrgBilling_invoices") {
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
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.invoices;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount
      };
    },
    getVariables(props, {count, cursor}, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: count,
        after: cursor
      };
    },
    query: graphql`
      query OrgBillingPaginationQuery($first: Int!, $after: DateTime, $orgId: ID!) {
        viewer {
          ...OrgBilling_viewer
        }
      }
    `
  }
);
