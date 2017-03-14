import React, {PropTypes} from 'react';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import {ORGANIZATIONS} from 'universal/utils/constants';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import IconControl from 'universal/components/IconControl/IconControl';
import Panel from 'universal/components/Panel/Panel';
import OrganizationRow from 'universal/modules/userDashboard/components/OrganizationRow/OrganizationRow';
import EmptyOrgsCallOut from 'universal/modules/userDashboard/components/EmptyOrgsCallOut/EmptyOrgsCallOut';
import {withRouter} from 'react-router';

const Organizations = (props) => {
  const {
    organizations,
    router,
    styles
  } = props;
  const gotoNewTeam = () => { router.push('/newteam/1'); };
  const addNewOrg = () =>
    <IconControl
      icon="plus-square-o"
      iconSize={ui.iconSize2x}
      label="New Organization"
      lineHeight={ui.iconSize2x}
      onClick={gotoNewTeam}
      padding={`0 0 0 ${ui.panelGutter}`}
    />;
  return (
    <UserSettingsWrapper settingsLocation={ORGANIZATIONS}>
      <div className={css(styles.wrapper)}>
        {organizations.length ?
          <Panel label="Organizations" controls={addNewOrg()}>
            {organizations.map((organization) =>
              <OrganizationRow
                key={`orgRow${organization.id}`}
                organization={organization}
                onRowClick={() => router.push(`/me/organizations/${organization.id}`)}
              />
            )}
          </Panel> :
          <EmptyOrgsCallOut />
        }
      </div>
    </UserSettingsWrapper>
  );
};

Organizations.propTypes = {
  organizations: PropTypes.array,
  router: PropTypes.object,
  styles: PropTypes.object
};

const styleThunk = () => ({
  wrapper: {
    maxWidth: '40rem'
  }
});

export default withRouter(withStyles(styleThunk)(Organizations));
