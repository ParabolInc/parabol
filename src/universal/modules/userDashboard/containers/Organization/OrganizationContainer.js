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
    members
    memberCount
    name
    picture
    validUntil
  }
}
`;

const mapStateToProps = (state, props) => {
  const {params: {orgId}} = props;
  const {organization: org} = cashay.query(organizationContainerQuery, {
    op: 'organizationContainer',
    key: orgId,
    resolveCached: {
      organization: () => orgId
    },
    resolveChannelKey: {
      billingLeaders: (source) => `${userId}::${source.id}`
    },
    variables: {orgId}
  }).data;
  return {
    org
  }
};

const OrganizationContainer = (props) => {
  const {org} = props;
  if (!org.id) {
    return <LoadingView/>;
  }
  return (
    <Organization org={org}/>
  );
};

export default connect(mapStateToProps)(OrganizationContainer);
