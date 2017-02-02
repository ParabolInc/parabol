import React, {Component, PropTypes} from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import LoadingView from 'universal/components/LoadingView/LoadingView';
import OrgMembers from 'universal/modules/userDashboard/components/OrgMembers/OrgMembers';

const organizationContainerQuery = `
query {
  usersByOrg(orgId: $orgId) @live {
    id
    isBillingLeader
    email
    inactive
    picture
    preferredName
  }
}
`;

// memoized
const countBillingLeaders = (users) => {
  if (users !== countBillingLeaders.users) {
    countBillingLeaders.users = users;
    countBillingLeaders.cache = users.reduce((count, user) => user.isBillingLeader ? count + 1 : count, 0);
  }
  return countBillingLeaders.cache;
};

const mapStateToProps = (state, props) => {
  const {orgId} = props;
  const {usersByOrg: users} = cashay.query(organizationContainerQuery, {
    op: 'orgMembersContainer',
    key: orgId,
    variables: {orgId}
  }).data;
  return {
    billingLeaderCount: countBillingLeaders(users),
    myUserId: state.auth.obj.sub,
    users
  }
};

const OrgMembersContainer = (props) => {
  const {billingLeaderCount, dispatch, myUserId, orgId, users}= props;
  if (users.length < 1) {
    return <LoadingView/>;
  }
  return (
    <OrgMembers
      billingLeaderCount={billingLeaderCount}
      dispatch={dispatch}
      myUserId={myUserId}
      orgId={orgId}
      users={users}
    />
  );
};

export default connect(mapStateToProps)(OrgMembersContainer);
