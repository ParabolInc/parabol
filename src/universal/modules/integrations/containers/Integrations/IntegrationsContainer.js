import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import portal from 'react-portal-hoc';
import Integrations from 'universal/modules/integrations/components/Integrations/Integrations';

const teamSettingsQuery = `
query {
  integrations(teamMemberId: $teamMemberId) @live {
    id
    accessToken
    service
    userId
    syncs {
      id
      slackChannelId
    }
  }
}`;

const serviceMap = (integrations) => {
  if (integrations !== serviceMap.integrations) {
    serviceMap.integrations = integrations;
    serviceMap.cache = {};
    for (let i = 0; i < integrations.length; i++) {
      const integrationService = integrations[i];
      const {service, ...content} = integrationService;
      serviceMap.cache[service] = content;
    }
  }
  return serviceMap.cache;
};

const mapStateToProps = (state, props) => {
  const {teamMemberId} = props;
  const {integrations} = cashay.query(teamSettingsQuery, {
    op: 'integrationsContainer',
    key: teamMemberId,
    sort: {
      integrations: (a, b) => a.service > b.service ? 1 : -1
    },
    variables: {teamMemberId}
  }).data;
  return {
    services: serviceMap(integrations)
  };
};

const IntegrationsContainer = (props) => {
  const {
    closeAfter,
    closePortal,
    isClosing,
    teamMemberId,
    services
  } = props;
  return (
    <Integrations
      closeAfter={closeAfter}
      closePortal={closePortal}
      isClosing={isClosing}
      teamMemberId={teamMemberId}
      services={services}
    />
  );
};

IntegrationsContainer.propTypes = {
  closeAfter: PropTypes.number.isRequired,
  closePortal: PropTypes.func.isRequired,
  isClosing: PropTypes.bool,
  teamMemberId: PropTypes.string.isRequired,
  services: PropTypes.object.isRequired
};

export default portal({escToClose: true, closeAfter: 100})(
  connect(mapStateToProps)(IntegrationsContainer)
);
