import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import {formValueSelector} from 'redux-form';
import requireAuth from 'universal/decorators/requireAuth/requireAuth';

import {
  Step1PreferredName,
  Step2TeamName,
  Step3InviteTeam
} from '../../components/WelcomeWizardForms';

const selector = formValueSelector('welcomeWizard');

const getUserAndMemberships = `
query {
  user: getCurrentUser {
    id,
    email,
    id,
    isNew,
    picture,
    preferredName
    memberships {
      id,
      team {
       id,
       name
      },
      isLead,
      isActive,
      isFacilitator
    }
  }
}`;

const mutationHandlers = {
  createTeam(optimisticVariables, queryResponse, currentResponse) {
    if (optimisticVariables) {
      const {leader, id, name, isActive, isLead, isFacilitator} = optimisticVariables.newTeam;
      const membership = {
        id: leader.id,
        team: {id, name},
        isActive,
        isLead,
        isFacilitator
      };
      currentResponse.user.memberships.push(membership);
      return currentResponse;
    }
    return undefined;
  }
};

const queryOptions = {
  component: 'WelcomeContainer',
  mutationHandlers,
  localOnly: false
};

const mapStateToProps = (state) => ({
  authToken: state.authToken,
  invitees: selector(state, 'invitees'),
  inviteesRaw: selector(state, 'inviteesRaw'),
  preferredName: selector(state, 'preferredName'),
  teamName: selector(state, 'teamName'),
  user: cashay.query(getUserAndMemberships, queryOptions).data.user,
  welcome: state.welcome
});

const WelcomeContainer = (props) => {
  const {page, completed} = props.welcome;
  return (
    <div>
      {page === 1 && <Step1PreferredName completed={completed} {...props}/>}
      {page === 2 && <Step2TeamName completed={completed} {...props}/>}
      {page === 3 && <Step3InviteTeam {...props}/>}
    </div>
  );
};

WelcomeContainer.propTypes = {
  dispatch: PropTypes.func,
  invitees: PropTypes.array,
  inviteesRaw: PropTypes.string,
  preferredName: PropTypes.string,
  teamName: PropTypes.string,
  welcome: PropTypes.shape({
    teamId: PropTypes.string,
    teamMemberId: PropTypes.string
  })
};

export default connect(mapStateToProps)(
  requireAuth(WelcomeContainer)
);
