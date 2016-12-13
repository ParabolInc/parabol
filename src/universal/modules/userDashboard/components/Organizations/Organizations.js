import React, {Component, PropTypes} from 'react';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import {ORGANIZATIONS} from 'universal/utils/constants';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';
import OrganizationRow from 'universal/modules/userDashboard/components/OrganizationRow/OrganizationRow';
import {withRouter} from 'react-router';

const Organizations = (props) => {
  const {organizations, router, styles} = props;
  return (
    <UserSettingsWrapper activeTab={ORGANIZATIONS}>
      <div>
        <h2>
          Organizations
        </h2>
        <div>You are a billing admin for these organizations</div>
      </div>
      <hr/>
      <div className={css(styles.createNewOrg)}>
        + Create new organization
      </div>
      <div className={css(styles.orgList)}>
        {organizations.map((organization) =>
          <OrganizationRow
            key={`orgRow${organization.id}`}
            name={organization.name}
            onRowClick={() => router.push(`/me/organizations/${organization.id}`)}
          />
        )}
      </div>

    </UserSettingsWrapper>
  );
}

const styleThunk = () => ({
  createNewOrg: {},
  orgList: {}
});

export default withRouter(withStyles(styleThunk)(Organizations));
