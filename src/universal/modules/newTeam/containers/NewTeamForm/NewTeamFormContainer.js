import React, {Component, PropTypes} from 'react';
import {cashay} from 'cashay';
import emailAddresses from 'email-addresses';
import shortid from 'shortid';
import {withRouter} from 'react-router';
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import makeAddTeamSchema from 'universal/validation/makeAddTeamSchema';
import addOrgSchema from 'universal/validation/addOrgSchema';
import {segmentEventTrack} from 'universal/redux/segmentActions';
import {connect} from 'react-redux';
import NewTeamForm from 'universal/modules/newTeam/components/NewTeamForm/NewTeamForm';

const orgDropdownMenuItemsQuery = `
query {
  orgCount(userId: $userId)
  organizations(userId: $userId) @live {
    id
    name
  }
}
`;

const mapStateToProps = (state, props) => {
  const {newOrgRoute} = props;
  const userId = state.auth.obj.sub;
  const {orgCount, organizations} = cashay.query(orgDropdownMenuItemsQuery, {
    op: 'newTeamFormContainer',
    key: userId,
    sort: {
      organizations: (a, b) => a.name > b.name ? 1 : -1
    },
    variables: {
      userId
    }
  }).data;
  const defaultOrg = organizations[0];
  const orgId = defaultOrg && defaultOrg.id;
  return {
    initialOrgCount: orgCount,
    organizations,
    initialValues: {
      orgId
    },
    isNewOrg: newOrgRoute
  };
};

const makeInvitees = (invitees) => {
  return invitees ? invitees.map(email => ({
    email: email.address,
    fullName: email.fullName
  })) : [];
};

class NewTeamFormContainer extends Component {
  constructor() {
    super();
    this.state = {};
  }

  onSubmit = async (submittedData) => {
    const {dispatch, isNewOrg, router} = this.props;
    const newTeamId = shortid.generate();
    if (isNewOrg) {
      const schema = addOrgSchema();
      const {data: {teamName, inviteesRaw, orgName, stripeToken}} = schema(submittedData);
      const parsedInvitees = emailAddresses.parseAddressList(inviteesRaw);
      const invitees = makeInvitees(parsedInvitees);
      const variables = {
        newTeam: {
          id: newTeamId,
          name: teamName,
          orgId: shortid.generate()
        },
        invitees,
        orgName,
        stripeToken
      };
      await cashay.mutate('addOrg', {variables});
      dispatch(segmentEventTrack('New Org'));
      dispatch(showSuccess({
        title: 'Organization successfully created!',
        message: `Here's your new team dashboard for ${teamName}`
      }));
    } else {
      const schema = makeAddTeamSchema();
      const {data: {teamName, inviteesRaw, orgId}} = schema(submittedData);
      const parsedInvitees = emailAddresses.parseAddressList(inviteesRaw);
      const invitees = makeInvitees(parsedInvitees);
      const variables = {
        newTeam: {
          id: newTeamId,
          name: teamName,
          orgId
        },
        invitees,
      };
      await cashay.mutate('addTeam', {variables});
      dispatch(segmentEventTrack('New Team',
        {inviteeCount: invitees && invitees.length || 0}
      ));
      dispatch(showSuccess({
        title: 'Team successfully created!',
        message: `Here's your new team dashboard for ${teamName}`
      }));
    }
    router.push(`/team/${newTeamId}`);
  };

  setLast4 = (last4) => {
    this.setState({
      last4,
    });
  };

  render() {
    const {initialOrgCount, initialValues, isNewOrg, organizations, router} = this.props;
    if (initialOrgCount === 0) {
      router.push('/newteam/1');
    } else if (!initialValues.orgId) {
      return null;
    }
    return (
      <NewTeamForm
        initialValues={initialValues}
        isNewOrg={isNewOrg}
        last4={this.state.last4}
        onSubmit={this.onSubmit}
        organizations={organizations}
        setLast4={this.setLast4}
      />
    );
  }
}


NewTeamFormContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  initialOrgCount: PropTypes.func.number,
  initialValues: PropTypes.object,
  isNewOrg: PropTypes.bool,
  organizations: PropTypes.array,
  router: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(
  withRouter(
    NewTeamFormContainer
  )
);
