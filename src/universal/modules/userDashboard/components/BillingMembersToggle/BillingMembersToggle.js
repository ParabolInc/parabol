import React, {PropTypes} from 'react';
import {BILLING_PAGE, MEMBERS_PAGE} from 'universal/utils/constants';
import ToggleNav from 'universal/components/ToggleNav/ToggleNav';
import {withRouter} from 'react-router';

const BillingMembersToggle = (props) => {
  const {activeOrgDetail, router, orgId} = props;

  const items = [
    {
      label: 'Billing',
      icon: 'credit-card',
      isActive: activeOrgDetail === BILLING_PAGE,
      onClick: () => router.push(`/me/organizations/${orgId}/billing`)
    },
    {
      label: 'Members',
      icon: 'users',
      isActive: activeOrgDetail === MEMBERS_PAGE,
      onClick: () => router.push(`/me/organizations/${orgId}/members`)
    }
  ];

  return (
    <ToggleNav items={items}/>
  );
};

BillingMembersToggle.propTypes = {
  activeOrgDetail: PropTypes.string.isRequired,
  orgId: PropTypes.string.isRequired,
  router: PropTypes.object.isRequired
};

export default withRouter(BillingMembersToggle);
