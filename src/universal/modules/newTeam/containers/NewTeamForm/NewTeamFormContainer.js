import React, {PropTypes} from 'react';
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
import LoadingView from 'universal/components/LoadingView/LoadingView';


const orgDropdownMenuItemsQuery = `
query {
  organizations(userId: $userId) @live {
    id
    name
  }
}
`;

const mapStateToProps = (state) => {
  const userId = state.auth.obj.sub;
  const {organizations} = cashay.query(orgDropdownMenuItemsQuery, {
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
  const orgId = defaultOrg && defaultOrg.id || null;
  return {
    organizations,
    initialValues: {
      orgId
    },
    isNewOrg: state.form.newTeam && state.form.newTeam.values.orgId === null
  };
};

const NewTeamFormContainer = (props) => {
  const {dispatch, initialValues, isNewOrg, organizations, router} = props;
  const onSubmit = (submittedData) => {
    const {isNewOrg} = props;
    const schema = isNewOrg ? addOrgSchema() : makeAddTeamSchema();
    const {data: {teamName, inviteesRaw}} = schema(submittedData);
    const invitees = emailAddresses.parseAddressList(inviteesRaw);
    const serverInvitees = invitees ? invitees.map(email => ({
        email: email.address,
        fullName: email.fullName
      })) : [];
    const id = shortid.generate();
    const options = {
      variables: {
        newTeam: {
          id,
          name: teamName
        },
        invitees: serverInvitees
      }
    };
    cashay.mutate('addTeam', options);
    router.push(`/team/${id}`);
    dispatch(segmentEventTrack('New Team',
      {inviteeCount: invitees && invitees.length || 0}
    ));
    dispatch(showSuccess({
      title: 'Team successfully created!',
      message: `Here's your new team dashboard for ${teamName}`
    }));
  };
  if (organizations.length === 0) {
    // more than looks, this is required because initialValues can only be passed in once
    return <LoadingView />
  }
  return (
    <NewTeamForm
      initialValues={initialValues}
      isNewOrg={isNewOrg}
      onSubmit={onSubmit}
      organizations={organizations}
    />
  );
};

NewTeamFormContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(
  withRouter(
    NewTeamFormContainer
  )
);
