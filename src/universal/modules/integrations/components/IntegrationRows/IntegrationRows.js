import PropTypes from 'prop-types';
import React from 'react';
import withStyles from '../../../../styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
// import appTheme from '../../../../styles/theme/appTheme';
// import {overflowTouch} from 'universal/styles/helpers';
// import allServices from 'universal/modules/integrations/helpers/allServices';
// import ui from 'universal/styles/ui';
import IntegrateSlack from 'universal/modules/integrations/components/IntegrateSlack/IntegrateSlack';

const IntegrationRows = (props) => {
  const {
    services,
    teamMemberId,
    styles
  } = props;

  return (
    <div className={css(styles.integrations)}>
      <IntegrateSlack service={services.slack} teamMemberId={teamMemberId} />

      {/* <ServiceRow*/}
      {/* accessToken={tokenLookup.slack}*/}
      {/* dropdownMapper={dropdownMapper}*/}
      {/* label="Sync a project"*/}
      {/* logo={githubLogo}*/}
      {/* name="GitHub"*/}
      {/* openOauth={() => {*/}
      {/* eslint-disable max-len */}
      {/* const uri = `https://github.com/login/oauth/authorize?scope=user:email,repo,write:repo_hook&state=${teamMemberId}&client_id=${__GITHUB_CLIENT_ID__}`;*/}
      {/* eslint-enable max-len */}
      {/* window.open(uri);*/}
      {/* }}*/}
      {/* removeOauth={() => {*/}
      {/* cashay.mutate('removeIntegration', {variables: {teamMemberId, service: 'github'}})*/}
      {/* }}*/}
      {/* form={`${service}Form`}*/}
      {/* />*/}

      {/* {allServices.map((integration) => {*/}
      {/* const {openOauth, removeOauth, service, logo, name, dropdownMapper} = integration;*/}
      {/* const matchingService = services.find((s) => s.service === service);*/}
      {/* const accessToken = matchingService && matchingService.id;*/}
      {/* return (*/}
      {/* <ServiceRow*/}
      {/* key={service}*/}
      {/* accessToken={accessToken}*/}
      {/* dropdownMapper={dropdownMapper}*/}
      {/* logo={logo}*/}
      {/* name={name}*/}
      {/* openOauth={openOauth(teamMemberId)}*/}
      {/* removeOauth={removeOauth(teamMemberId)}*/}
      {/* form={`${service}Form`}*/}
      {/* />*/}
      {/* )*/}
      {/* })}*/}
    </div>
  );
};

IntegrationRows.propTypes = {
  services: PropTypes.object.isRequired,
  teamMemberId: PropTypes.string.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  // Define
});

export default withStyles(styleThunk)(IntegrationRows);
