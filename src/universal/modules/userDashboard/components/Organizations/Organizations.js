import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {createFragmentContainer} from 'react-relay';
import Atmosphere from 'universal/Atmosphere';
import IconControl from 'universal/components/IconControl/IconControl';
import Panel from 'universal/components/Panel/Panel';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import EmptyOrgsCallOut from 'universal/modules/userDashboard/components/EmptyOrgsCallOut/EmptyOrgsCallOut';
import OrganizationRow from 'universal/modules/userDashboard/components/OrganizationRow/OrganizationRow';
import UserSettingsWrapper from 'universal/modules/userDashboard/components/UserSettingsWrapper/UserSettingsWrapper';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import OrganizationUpdatedSubscription from 'universal/subscriptions/OrganizationUpdatedSubscription';

const subscriptions = [
  OrganizationUpdatedSubscription
];

class Organizations extends Component {
  componentDidMount() {
    this._queryKey = Atmosphere.getKey('Organizations', {});
    const {atmosphere, viewer: {organizations}} = this.props;
    organizations.forEach((organization) => {
      const subParams = {orgId: organization.id};
      atmosphere.registerQuery(this._queryKey, subscriptions, subParams, {});
    });
  }

  componentWillUnmount() {
    const {atmosphere} = this.props;
    atmosphere.unregisterQuery(this._queryKey);
  }

  render() {
    const {
      history,
      styles,
      viewer
    } = this.props;
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
  }
}

Organizations.propTypes = {
  atmosphere: PropTypes.object.isRequired,
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
  withAtmosphere(withStyles(styleThunk)(Organizations)),
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
