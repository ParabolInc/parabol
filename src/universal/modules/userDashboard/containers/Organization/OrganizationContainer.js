import React, {Component, PropTypes} from 'react';
import Organization from 'universal/modules/userDashboard/components/Organization/Organization';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import LoadingView from 'universal/components/LoadingView/LoadingView';

const organizationContainerQuery = `
query {
  organization(orgId: $orgId) @live {
    id
    activeUserCount
    createdAt
    inactiveUserCount
    isTrial
    name
    picture
    validUntil
  }
  billingLeaders(orgId: $orgId) @live {
    id
    email
    inactive
    picture
    preferredName
  }
}
`;

const mapStateToProps = (state, props) => {
  const {params: {orgId}} = props;
  const {billingLeaders, organization: org} = cashay.query(organizationContainerQuery, {
    op: 'organizationContainer',
    key: orgId,
    resolveCached: {
      organization: () => orgId
    },
    sort: {
      billingLeaders: (a, b) => a.preferredName > b.preferredName ? 1 : -1,
    },
    variables: {orgId}
  }).data;
  return {
    billingLeaders,
    myUserId: state.auth.obj.sub,
    org,
    leaveOrgModal: state.orgSettings.leaveOrgModal,
    removeBillingLeaderModal: state.orgSettings.removeBillingLeaderModal,
    modalUserId: state.orgSettings.userId,
    modalPreferredName: state.orgSettings.preferredName,
  }
};

const OrganizationContainer = (props) => {
  const {
    leaveOrgModal,
    removeBillingLeaderModal,
    modalUserId,
    modalPreferredName,
    billingLeaders,
    dispatch,
    myUserId,
    org
  }= props;
  if (!org.id) {
    return <LoadingView/>;
  }
  return (
    <Organization
      billingLeaders={billingLeaders}
      dispatch={dispatch}
      myUserId={myUserId}
      org={org}
      leaveOrgModal={leaveOrgModal}
      removeBillingLeaderModal={removeBillingLeaderModal}
      modalUserId={modalUserId}
      modalPreferredName={modalPreferredName}
    />
  );
};

export default connect(mapStateToProps)(OrganizationContainer);
