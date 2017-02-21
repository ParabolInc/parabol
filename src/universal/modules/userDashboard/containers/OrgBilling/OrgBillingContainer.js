import React, {PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import OrgBilling from 'universal/modules/userDashboard/components/OrgBilling/OrgBilling';

const organizationContainerQuery = `
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
}
`;

const invoices = [
  {
    invoiceDate: new Date(1484539569909),
    amount: 22.5,
    isEstimate: true
  },
  {
    invoiceDate: new Date(1481861169909),
    amount: 25
  },
  {
    invoiceDate: new Date(1479269976347),
    amount: 20
  }
];

const mapStateToProps = (state, props) => {
  const {orgId} = props;
  const {organization: org} = cashay.query(organizationContainerQuery, {
    op: 'orgBillingContainer',
    key: orgId,
    variables: {orgId}
  }).data;
  return {
    org
  };
};

const OrgBillingContainer = (props) => {
  const {dispatch, org} = props;
  if (!org.id) {
    return <LoadingView/>;
  }
  return (
    <OrgBilling
      dispatch={dispatch}
      invoices={invoices}
      org={org}
    />
  );
};

OrgBillingContainer.propTypes = {
  dispatch: PropTypes.func,
  org: PropTypes.object
};

export default connect(mapStateToProps)(OrgBillingContainer);
