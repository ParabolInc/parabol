import React, {PropTypes} from 'react';
import Organization from 'universal/modules/userDashboard/components/Organization/Organization';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import {BILLING_PAGE} from 'universal/utils/constants';

const organizationContainerQuery = `
query {
  organization(orgId: $orgId) @live {
    id
    activeUserCount
    createdAt
    inactiveUserCount
    name
    picture
    periodEnd
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
  };
};

const OrganizationContainer = (props) => {
  const {
    activeOrgDetail,
    billingLeaders,
    dispatch,
    myUserId,
    org
  } = props;
  if (!org.id) {
    return <LoadingView />;
  }
  return (
    <Organization
      activeOrgDetail={activeOrgDetail}
      billingLeaders={billingLeaders}
      dispatch={dispatch}
      myUserId={myUserId}
      org={org}
    />
  );
};

OrganizationContainer.propTypes = {
  activeOrgDetail: PropTypes.string,
  billingLeaders: PropTypes.array,
  dispatch: PropTypes.func,
  myUserId: PropTypes.string,
  org: PropTypes.object
};

export default connect(mapStateToProps)(OrganizationContainer);
