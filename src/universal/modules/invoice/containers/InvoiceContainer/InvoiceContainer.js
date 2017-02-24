import React, {PropTypes} from 'react';
import Invoice from 'universal/modules/invoice/components/Invoice/Invoice';
import {cashay} from 'cashay';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {connect} from 'react-redux';

const invoiceContainerQuery = `
query {
  invoiceDetails(invoiceId: $invoiceId) {
    id
    amountDue
    billingLeaderEmails
    creditCard {
      brand
      last4
    }
    endAt
    invoiceDate
    lines {
      id
      amount
      description
      details {
        id
        amount
        email
        startAt
        endAt
      }
      quantity
      type
    }
    nextMonthCharges {
      amount
      nextPeriodEnd
      quantity
      unitPrice
    }
    orgName
    startingBalance
    startAt
    status
    total
  }
}
`;

const mapStateToProps = (state, props) => {
  const {params: {invoiceId}} = props;
  const {invoiceDetails} = cashay.query(invoiceContainerQuery, {
    op: 'invoiceContainer',
    key: invoiceId,
    sort: {
      lines: (a, b) => a.type > b.type ? 1 : -1
    },
    variables: {invoiceId}
  }).data;
  return {
    invoiceDetails
  };
};

const InvoiceContainer = (props) => {
  const {invoiceDetails} = props;
  if (!invoiceDetails.id) {
    return <LoadingView/>;
  }
  return <Invoice invoice={invoiceDetails}/>;
};

InvoiceContainer.propTypes = {
  invoiceDetails: PropTypes.object
};

export default connect(mapStateToProps)(InvoiceContainer);
