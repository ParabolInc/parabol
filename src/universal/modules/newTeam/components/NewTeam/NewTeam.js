import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import NewTeamForm from 'universal/modules/teamDashboard/components/NewTeamForm/NewTeamForm';
import {connect} from 'react-redux';
import DashboardWrapper from 'universal/components/DashboardWrapper/DashboardWrapper';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const newTeamOrgDropdownQuery = `
query {
  organizations(userId: $userId) @live {
    id
    name
  }
}
`;

const mapStateToProps = (state, props) => {
  const userId = state.auth.obj.sub;
  const {organizations} = cashay.query(newTeamOrgDropdownQuery, {
    op: 'organizationsContainer',
    key: userId,
    sort: {
      organizations: (a, b) => a.name > b.name ? 1 : -1
    },
    variables: {
      userId
    }
  }).data;
  return {
    organizations
  };
};

const NewTeam = (props) => {
  const {dispatch, styles} = props;
  return (
    <DashboardWrapper title="User Dashboard">
        <NewTeamForm dispatch={dispatch}/>
    </DashboardWrapper>
  );
};

NewTeam.propTypes = {
  dispatch: PropTypes.func.isRequired,
  styles: PropTypes.object,
};

const styleThunk = () => ({
  newTeamView: {
    padding: '2rem'
  }
});

export default
dragDropContext(HTML5Backend)(
  socketWithPresence(
    connect()(withStyles(styleThunk)(NewTeam)
    )
  )
);

