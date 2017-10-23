import PropTypes from 'prop-types';
import React from 'react';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import CallOutPanel from 'universal/components/CallOutPanel/CallOutPanel';
import {withRouter} from 'react-router-dom';

const EmptyOrgsCallOut = (props) => {
  const {
    history
  } = props;

  const gotoNewTeam = () => { history.push('/newteam'); };
  const button = (
    <Button
      colorPalette="cool"
      label="Start a New Organization"
      onClick={gotoNewTeam}
      size={ui.ctaPanelButtonSize}
    />
  );

  return (
    <CallOutPanel control={button} heading={'You don’t own any organizations!'} panelLabel={'Organizations'}>
      <span>{'You can create a new organization'}<br />{'and manage your own teams and projects.'}</span>
    </CallOutPanel>
  );
};

EmptyOrgsCallOut.propTypes = {
  history: PropTypes.object
};

export default withRouter(EmptyOrgsCallOut);
