import React, {Component, PropTypes} from 'react';
import Organization from 'universal/modules/userDashboard/components/Organization/Organization';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {BILLING_PAGE} from 'universal/modules/userDashboard/ducks/orgSettingsDuck';

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
}
`;

const mapStateToProps = (state, props) => {
  const {params: {orgId, orgArea}} = props;
  const {billingLeaders, organization: org} = cashay.query(organizationContainerQuery, {
    op: 'organizationContainer',
    key: orgId,
    sort: {
      billingLeaders: (a, b) => a.preferredName > b.preferredName ? 1 : -1,
    },
    variables: {orgId}
  }).data;
  return {
    activeOrgDetail: orgArea || BILLING_PAGE,
    billingLeaders,
    myUserId: state.auth.obj.sub,
    org,
    openModal: state.orgSettings.openModal,
    modalUserId: state.orgSettings.userId,
    modalPreferredName: state.orgSettings.preferredName,
  }
};

const OrganizationContainer = (props) => {
  const {
    activeOrgDetail,
    billingLeaders,
    dispatch,
    modalPreferredName,
    modalUserId,
    modalActions,
    myUserId,
    openModal,
    org
  }= props;
  if (!org.id) {
    return <LoadingView/>;
  }
  return (
    <Organization
      activeOrgDetail={activeOrgDetail}
      billingLeaders={billingLeaders}
      dispatch={dispatch}
      modalPreferredName={modalPreferredName}
      modalUserId={modalUserId}
      modalActions={modalActions}
      myUserId={myUserId}
      org={org}
      openModal={openModal}
    />
  );
};

export default connect(mapStateToProps)(OrganizationContainer);
