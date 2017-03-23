import React, {PropTypes} from 'react';
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
  organization(orgId: $orgId) @live {
    id
    periodStart
    periodEnd
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
  const {usersByOrg: users, organization: org} = cashay.query(organizationContainerQuery, {
    op: 'orgMembersContainer',
    key: orgId,
    sort: {
      usersByOrg: (a, b) => {
        if (a.isBillingLeader === b.isBillingLeader) {
          return a.preferredName > b.preferredName ? 1 : -1;
        }
        return a.isBillingLeader ? -1 : 1;
      }
    },
    variables: {orgId}
  }).data;
  return {
    billingLeaderCount: countBillingLeaders(users),
    myUserId: state.auth.obj.sub,
    users,
    org
  };
};

const OrgMembersContainer = (props) => {
  const {billingLeaderCount, dispatch, myUserId, users, org} = props;
  if (users.length < 1) {
    return <LoadingView />;
  }
  return (
    <OrgMembers
      billingLeaderCount={billingLeaderCount}
      dispatch={dispatch}
      myUserId={myUserId}
      org={org}
      users={users}
    />
  );
};

OrgMembersContainer.propTypes = {
  billingLeaderCount: PropTypes.number,
  dispatch: PropTypes.func,
  myUserId: PropTypes.string,
  org: PropTypes.object,
  users: PropTypes.array,
};

export default connect(mapStateToProps)(OrgMembersContainer);
