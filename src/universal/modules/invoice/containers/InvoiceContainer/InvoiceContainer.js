import React from 'react';
import Invoice from 'universal/modules/invoice/components/Invoice/Invoice';
import {cashay} from 'cashay';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {connect} from 'react-redux';

const invoiceContainerQuery = `
query {
  invoiceDetails(invoiceId: $invoiceId) {
    id
    amount
    endAt
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
    startAt
    status
  }
}
`;

const mapStateToProps = (state, props) => {
  const {params: {invoiceId}} = props;
  const {invoiceDetails} = cashay.query(invoiceContainerQuery, {
    op: 'invoiceContainer',
    key: invoiceId,
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

export default connect(mapStateToProps)(InvoiceContainer);
