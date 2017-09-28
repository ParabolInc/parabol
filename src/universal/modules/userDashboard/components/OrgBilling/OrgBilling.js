import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import FontAwesome from 'react-fontawesome';
import {createPaginationContainer} from 'react-relay';
import Button from 'universal/components/Button/Button';
import Panel from 'universal/components/Panel/Panel';
import InvoiceRow from 'universal/modules/userDashboard/components/InvoiceRow/InvoiceRow';
import CreditCardModalContainer from 'universal/modules/userDashboard/containers/CreditCardModal/CreditCardModalContainer';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

class OrgBilling extends Component {
  _loadMore() {
    const {relay: {hasMore, isLoading, loadMore}} = this.props;
    if (!hasMore() || isLoading()) return;

    loadMore(
      10, // Fetch the next 10 feed items
      (e) => {
        console.log(e);
      }
    );
  }

  render() {
    const {
      styles,
      org,
      viewer: {invoices}
    } = this.props;
    const hasInvoices = invoices.edges.length > 0;
    const {creditCard = {}, id: orgId} = org;
    const {brand = '???', last4 = '••••', expiry = '???'} = creditCard;
    const update = (<Button
      colorPalette="cool"
      label="Update"
      size="small"
    />);
    return (
      <div>
        <Panel label="Credit Card Information">
          <div className={css(styles.infoAndUpdate)}>
            <div className={css(styles.creditCardInfo)}>
              <FontAwesome className={css(styles.creditCardIcon)} name="credit-card" />
              <span className={css(styles.creditCardProvider)}>{brand || '???'}</span>
              <span className={css(styles.creditCardNumber)}>•••• •••• •••• {last4 || '••••'}</span>
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
          </div>
        </Panel>
      </div>
    );
  }
}

OrgBilling.propTypes = {
  invoices: PropTypes.array,
  invoicesReady: PropTypes.bool,
  styles: PropTypes.object,
  org: PropTypes.object
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
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    padding: `0 ${ui.panelGutter} ${ui.panelGutter}`
  },

  noInvoices: {
    textAlign: 'center',
    margin: '1rem'
  }
});

export default createPaginationContainer(
  withStyles(styleThunk)(OrgBilling),
  graphql`
    fragment OrgBilling_viewer on User {
      invoices(first: $first, orgId: $orgId, after: $after) @connection(key: "OrgBilling_invoices") {
        edges {
          node {
            id
            amountDue
            endAt
            paidAt
            startAt
            status
          }
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
        // in most cases, for variables other than connection filters like
        // `first`, `after`, etc. you may want to use the previous values.
        // orderBy: fragmentVariables.orderBy,
      };
    },
    query: graphql`
      query OrgBillingPaginationQuery($first: Int!, $after: String, $orgId: ID!) {
        viewer {
          ...OrgBilling_viewer
        }
      }
    `
  }
);
