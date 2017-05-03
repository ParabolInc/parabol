import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Toast from 'universal/modules/toast/containers/Toast/Toast';
import {Route, Switch} from 'react-router-dom';
import LandingBundle from 'universal/modules/landing/containers/Landing/LandingBundle';
import WelcomeBundle from 'universal/modules/welcome/containers/Welcome/WelcomeBundle';
import TeamBundle from 'universal/modules/teamDashboard/containers/Team/TeamBundle';
import UserBundle from 'universal/modules/userDashboard/components/UserDashboard/UserBundle';
import SignoutBundle from "../../containers/Signout/SignoutBundle";
import NotFoundBundle from "../NotFound/NotFoundBundle";
import NewTeamBundle from "../../modules/newTeam/components/NewTeam/NewTeamBundle";

const Action = (props) => {
  const {styles} = props;
  return (
    <div className={css(styles.app)}>
      <Toast />
      <Switch>
        <Route exact path="/" component={LandingBundle}/>
        <Route path="/welcome" component={WelcomeBundle}/>
        <Route path="/newteam/:newOrg?" component={NewTeamBundle}/>
        <Route path="/team/:teamId" component={TeamBundle}/>
        <Route path="/me" component={UserBundle}/>
        <Route path="/signout" component={SignoutBundle}/>
        <Route component={NotFoundBundle}/>
      </Switch>
    </div>
  );
};

Action.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  app: {
    margin: 0,
    minHeight: '100vh',
    padding: 0,
    width: '100%'
  }
});

export default withStyles(styleThunk)(Action);
