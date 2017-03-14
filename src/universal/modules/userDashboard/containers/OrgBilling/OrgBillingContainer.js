import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import OrgBilling from 'universal/modules/userDashboard/components/OrgBilling/OrgBilling';

export const organizationContainerQuery = `
query {
  organization(orgId: $orgId) @live {
    id
    creditCard {
      brand
      expiry
      last4
    }
    periodEnd
  }
  upcomingInvoice(orgId: $orgId) @live {
    id
    amountDue
    cursor
    endAt
    paidAt
    startAt
    status
  }
  invoiceList(orgId: $orgId, count: $count) {
    id
    amountDue
    cursor
    endAt
    paidAt
    startAt
    status
  }
}
`;

// const invoices = [
//   {
//     invoiceDate: new Date(1484539569909),
//     amount: 22.5,
//     isEstimate: true
//   },
//   {
//     invoiceDate: new Date(1481861169909),
//     amount: 25
//   },
//   {
//     invoiceDate: new Date(1479269976347),
//     amount: 20
//   }
// ];

const mapStateToProps = (state, props) => {
  const {orgId} = props;
  const res = cashay.query(organizationContainerQuery, {
    op: 'orgBillingContainer',
    key: orgId,
    variables: {
      orgId,
      count: 5
    }
  });
  const {data: {organization: org, invoiceList, upcomingInvoice}} = res;
  return {
    invoiceList,
    org,
    upcomingInvoice,
    invoicesReady: Boolean(upcomingInvoice.id)
  };
};

const OrgBillingContainer = (props) => {
  const {dispatch, invoiceList, invoicesReady, org, upcomingInvoice} = props;
  const invoices = [
    upcomingInvoice,
    ...invoiceList
  ];
  if (!org.id) {
    return <LoadingView />;
  }
  return (
    <OrgBilling
      dispatch={dispatch}
      invoices={invoices}
      invoicesReady={invoicesReady}
      org={org}
    />
  );
};

OrgBillingContainer.propTypes = {
  dispatch: PropTypes.func,
  invoiceList: PropTypes.array,
  invoicesReady: PropTypes.bool,
  org: PropTypes.object,
  upcomingInvoice: PropTypes.object
};

export default connect(mapStateToProps)(OrgBillingContainer);
