import {cashay} from 'cashay';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {SubmissionError} from 'redux-form';
import shortid from 'shortid';
import NewTeamForm from 'universal/modules/newTeam/components/NewTeamForm/NewTeamForm';
import {showSuccess} from 'universal/modules/toast/ducks/toastDuck';
import parseEmailAddressList from 'universal/utils/parseEmailAddressList';
import addOrgSchema from 'universal/validation/addOrgSchema';
import makeAddTeamSchema from 'universal/validation/makeAddTeamSchema';
import AddOrgMutation from 'universal/mutations/AddOrgMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

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
  const {match: {params: {newOrgRoute}}} = props;
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
    isNewOrg: Boolean(newOrgRoute)
  };
};

const makeInvitees = (invitees) => {
  return invitees ? invitees.map((email) => ({
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
    const {atmosphere, dispatch, isNewOrg, history} = this.props;
    const newTeamId = shortid.generate();
    if (isNewOrg) {
      const schema = addOrgSchema();
      const {data: {teamName, inviteesRaw, orgName}} = schema(submittedData);
      const parsedInvitees = parseEmailAddressList(inviteesRaw);
      const invitees = makeInvitees(parsedInvitees);
      const newTeam = {
        id: newTeamId,
        name: teamName,
        orgId: shortid.generate()
      };
      const handleError = (err) => {
        throw new SubmissionError(err._error);
      };
      const handleCompleted = () => {
        dispatch(showSuccess({
          title: 'Organization successfully created!',
          message: `Here's your new team dashboard for ${teamName}`
        }));
      };
      AddOrgMutation(atmosphere, newTeam, invitees, orgName, handleError, handleCompleted);
    } else {
      const schema = makeAddTeamSchema();
      const {data: {teamName, inviteesRaw, orgId}} = schema(submittedData);
      const parsedInvitees = parseEmailAddressList(inviteesRaw);
      const invitees = makeInvitees(parsedInvitees);
      const variables = {
        newTeam: {
          id: newTeamId,
          name: teamName,
          orgId
        },
        invitees
      };
      await cashay.mutate('addTeam', {variables});
      dispatch(showSuccess({
        title: 'Team successfully created!',
        message: `Here's your new team dashboard for ${teamName}`
      }));
    }
    history.push(`/team/${newTeamId}`);
  };

  setLast4 = (last4) => {
    this.setState({
      last4
    });
  };

  render() {
    const {initialOrgCount, initialValues, isNewOrg, organizations, history} = this.props;
    if (initialOrgCount === 0) {
      history.push('/newteam/1');
    } else if (!initialValues.orgId) {
      return null;
    }
    return (
      <NewTeamForm
        history={history}
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
  initialOrgCount: PropTypes.number,
  initialValues: PropTypes.object,
  isNewOrg: PropTypes.bool,
  organizations: PropTypes.array,
  history: PropTypes.object.isRequired
};

export default connect(mapStateToProps)(
  withAtmosphere(NewTeamFormContainer)
);
