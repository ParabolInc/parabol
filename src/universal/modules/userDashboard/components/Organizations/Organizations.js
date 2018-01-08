import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import IconControl from 'universal/components/IconControl/IconControl';
import Panel from 'universal/components/Panel/Panel';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import EmptyOrgsCallOut from 'universal/modules/userDashboard/components/EmptyOrgsCallOut/EmptyOrgsCallOut';
import OrganizationRow from 'universal/modules/userDashboard/components/OrganizationRow/OrganizationRow';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';

const Organizations = (props) => {
  const {
    history,
    styles,
    viewer
  } = props;
  const {organizations} = viewer;
  const gotoNewTeam = () => {
    history.push('/newteam');
  };
  const addNewOrg = () =>
    (<IconControl
      icon="plus-square-o"
      iconSize={ui.iconSize2x}
      label="New Organization"
      lineHeight={ui.iconSize2x}
      onClick={gotoNewTeam}
      padding={`0 0 0 ${ui.panelGutter}`}
    />);
  return (
    <UserSettingsWrapper>
      <Helmet title="My Organizations | Parabol" />
      <div className={css(styles.wrapper)}>
        {organizations.length ?
          <Panel label="Organizations" controls={addNewOrg()}>
            {organizations.map((organization) =>
              (<OrganizationRow
                key={`orgRow${organization.id}`}
                organization={organization}
              />)
            )}
          </Panel> :
          <EmptyOrgsCallOut />
        }
      </div>
    </UserSettingsWrapper>
  );
};

Organizations.propTypes = {
  viewer: PropTypes.object,
  history: PropTypes.object,
  styles: PropTypes.object
};

const styleThunk = () => ({
  wrapper: {
    maxWidth: '40rem'
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(Organizations),
  graphql`
    fragment Organizations_viewer on User {
      organizations {
        id
        isBillingLeader
        orgUserCount {
          activeUserCount
          inactiveUserCount
        }
        name
        picture
        tier
      }
    }
  `
);
