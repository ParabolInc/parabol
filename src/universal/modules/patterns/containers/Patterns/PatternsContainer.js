import React from 'react';
import Helmet from 'react-helmet';
import NewTeamForm from '../../../newTeam/components/NewTeamForm/NewTeamForm';

const style = {
  margin: '0 auto',
  maxWidth: '80rem',
  padding: '2rem'
};

const PatternsContainer = () =>
  <div style={style}>
    <Helmet title="Welcome to the Action Pattern Library" />

    <h1>Pattern Library</h1>
    <NewTeamForm />

  </div>;

export default PatternsContainer;
