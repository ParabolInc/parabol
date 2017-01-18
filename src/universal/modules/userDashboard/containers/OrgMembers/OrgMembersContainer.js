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

const mapStateToProps = (state, props) => {
  const {orgId} = props;
  const {usersByOrg: users} = cashay.query(organizationContainerQuery, {
    op: 'orgMembersContainer',
    key: orgId,
    variables: {orgId}
  }).data;
  return {
    myUserId: state.auth.obj.sub,
    users
  }
};

const OrgMembersContainer = (props) => {
  const {dispatch, myUserId, users}= props;
  if (users.length < 1) {
    return <LoadingView/>;
  }
  return (
    <OrgMembers
      dispatch={dispatch}
      myUserId={myUserId}
      users={users}
    />
  );
};

export default connect(mapStateToProps)(OrgMembersContainer);
