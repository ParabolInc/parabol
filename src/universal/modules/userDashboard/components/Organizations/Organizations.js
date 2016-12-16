import React, {Component, PropTypes} from 'react';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import {ORGANIZATIONS} from 'universal/utils/constants';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';
import OrganizationRow from 'universal/modules/userDashboard/components/OrganizationRow/OrganizationRow';
import {withRouter} from 'react-router';
import cardSection from 'universal/styles/helpers/cardSection';

const Organizations = (props) => {
  const {organizations, router, styles} = props;
  return (
    <UserSettingsWrapper activeTab={ORGANIZATIONS}>
      <div className={css(styles.wrapper)}>
        <div>
          <h2>
            Organizations
          </h2>
          <div>You are a billing admin for these organizations</div>
        </div>
        <div className={css(styles.createNewOrg)}>
          <div className={css(styles.headerWithBorder)}>
            <div className={css(styles.headerTextBlock)}>
              <span>ORGANIZATIONS</span>
              <span className={css(styles.addOrg)}>
                <FontAwesome
                  className={css(styles.addOrgIcon)}
                  name="plus-square-o"
                  title="Create new organization"
                />
                Create new organization
              </span>
            </div>
          </div>
          <div className={css(styles.orgList)}>
            {organizations.map((organization) =>
              <OrganizationRow
                key={`orgRow${organization.id}`}
                organization={organization}
                onRowClick={() => router.push(`/me/organizations/${organization.id}`)}
              />
            )}
          </div>
        </div>
      </div>
    </UserSettingsWrapper>
  );
}

const styleThunk = () => ({
  addOrg: {
    fontSize: appTheme.typography.s5,
    color: appTheme.palette.cool,
    cursor: 'pointer'
  },

  addOrgIcon: {
    marginRight: '.5rem'
  },

  createNewOrg: {
    ...cardSection
  },
  headerTextBlock: {
    alignItems: 'center',
    display: 'flex',
    fontWeight: 700,
    justifyContent: 'space-between',
    margin: '1rem'
  },

  headerWithBorder: {
    borderBottom: '1px solid #c3c5d1',
  },

  orgList: {},
  wrapper: {
    maxWidth: '45rem'
  }
});

export default withRouter(withStyles(styleThunk)(Organizations));
