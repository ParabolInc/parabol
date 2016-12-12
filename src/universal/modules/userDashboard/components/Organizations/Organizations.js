import React, {Component, PropTypes} from 'react';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import {ORGANIZATIONS} from 'universal/utils/constants';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';

const Organizations = (props) => {
  const {organizations, styles} = props;
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
          <OrganizationRow key={`orgRow${organization.id}`} organization={organization}/>
        )}
      </div>

    </UserSettingsWrapper>
  );
}

const styleThunk = () => ({
  createNewOrg: {},
  orgList: {}
});

export default withStyles(styleThunk)(Organizations);
