import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import NewTeamFormContainer from 'universal/modules/newTeam/containers/NewTeamForm/NewTeamFormContainer';
import {connect} from 'react-redux';
import DashboardWrapper from 'universal/components/DashboardWrapper/DashboardWrapper';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const NewTeam = (props) => {
  const {dispatch, params: {newOrg}} = props;
  return (
    <DashboardWrapper title="User Dashboard">
      <NewTeamFormContainer dispatch={dispatch} newOrgRoute={Boolean(newOrg)} />
    </DashboardWrapper>
  );
};

NewTeam.propTypes = {
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.shape({
    newOrg: PropTypes.object
  })
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
