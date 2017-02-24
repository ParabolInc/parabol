import React, {PropTypes} from 'react';
import ui from 'universal/styles/ui';
import Button from 'universal/components/Button/Button';
import CallOutPanel from 'universal/components/CallOutPanel/CallOutPanel';
import {withRouter} from 'react-router';

const EmptyOrgsCallOut = (props) => {
  const {
    router
  } = props;

  const gotoNewTeam = () => { router.push('/newteam/1'); };
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
      <span>{'You can create a new organization'}<br/>{'and manage your own teams and projects.'}</span>
    </CallOutPanel>
  );
};

EmptyOrgsCallOut.propTypes = {
  router: PropTypes.object
};

export default withRouter(EmptyOrgsCallOut);
