import PropTypes from 'prop-types';
import React from 'react';
import {BILLING_PAGE, MEMBERS_PAGE} from 'universal/utils/constants';
import ToggleNav from 'universal/components/ToggleNav/ToggleNav';
import {matchPath, withRouter} from 'react-router-dom';

const BillingMembersToggle = (props) => {
  const {history, location: {pathname}, match, orgId} = props;
  const areaMatch = matchPath(pathname, {path: `${match.url}/:area?`});
  const activeOrgDetail = areaMatch.params.area || BILLING_PAGE;
  const items = [
    {
      label: 'Billing',
      icon: 'credit-card',
      isActive: activeOrgDetail === BILLING_PAGE,
      onClick: () => history.push(`/me/organizations/${orgId}/${BILLING_PAGE}`)
    },
    {
      label: 'Members',
      icon: 'users',
      isActive: activeOrgDetail === MEMBERS_PAGE,
      onClick: () => history.push(`/me/organizations/${orgId}/${MEMBERS_PAGE}`)
    }
  ];

  return (
    <ToggleNav items={items} />
  );
};

BillingMembersToggle.propTypes = {
  orgId: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default withRouter(BillingMembersToggle);
