import React, {Component, PropTypes} from 'react';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import {ORGANIZATIONS} from 'universal/utils/constants';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import appTheme from 'universal/styles/theme/appTheme';
import FontAwesome from 'react-fontawesome';
import IconControl from 'universal/components/IconControl/IconControl';
import Panel from 'universal/components/Panel/Panel';
import OrganizationRow from 'universal/modules/userDashboard/components/OrganizationRow/OrganizationRow';
import {withRouter} from 'react-router';
import cardSection from 'universal/styles/helpers/cardSection';

const Organizations = (props) => {
  const {organizations, router, styles} = props;
  const addNewOrg = () =>
    <IconControl
      icon="plus-square-o"
      iconSize={ui.iconSize2x}
      label="New Organization"
      lineHeight={ui.iconSize2x}
      padding={`0 0 0 ${ui.panelGutter}`}
    />;
  return (
    <UserSettingsWrapper activeTab={ORGANIZATIONS}>
      <div className={css(styles.wrapper)}>
        <div>
          <h2>
            Organizations
          </h2>
          <div>You are a billing admin for these organizations</div>
        </div>
        <Panel label="Organizations" controls={addNewOrg()}>
          <div className={css(styles.orgList)}>
            {organizations.map((organization) =>
              <OrganizationRow
                key={`orgRow${organization.id}`}
                organization={organization}
                onRowClick={() => router.push(`/me/organizations/${organization.id}`)}
              />
            )}
          </div>
        </Panel>
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
