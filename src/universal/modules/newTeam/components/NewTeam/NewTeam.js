import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import NewTeamFormContainer from 'universal/modules/newTeam/containers/NewTeamForm/NewTeamFormContainer';
import {connect} from 'react-redux';
import DashboardWrapper from 'universal/components/DashboardWrapper/DashboardWrapper';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';
import {DragDropContext as dragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const NewTeam = (props) => {
  const {dispatch, styles} = props;
  return (
    <DashboardWrapper title="User Dashboard">
        <NewTeamFormContainer dispatch={dispatch}/>
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

